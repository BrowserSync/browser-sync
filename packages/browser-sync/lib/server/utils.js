"use strict";

var fs = require("fs");
var path = require("path");
var join = require("path").join;
var connect = require("connect");
var Immutable = require("immutable");
var http = require("http");
var https = require("https");
var Map = require("immutable").Map;
var fromJS = require("immutable").fromJS;
var List = require("immutable").List;
var snippet = require("./../snippet").utils;
var _ = require("../lodash.custom");
var serveStatic = require("./serve-static-wrapper").default();
var serveIndex = require("serve-index");
var logger = require("../logger");
var snippetUtils = require("../snippet").utils;
var lrSnippet = require("resp-modifier");
var certPath = join(__dirname, "..", "..", "certs");

function getCa(options) {
    var caOption = options.getIn(["https", "ca"]);
    // if not provided, use Browsersync self-signed
    if (typeof caOption === "undefined") {
        return fs.readFileSync(join(certPath, "server.csr"));
    }
    // if a string was given, read that file from disk
    if (typeof caOption === "string") {
        return fs.readFileSync(caOption);
    }
    // if an array was given, read all
    if (List.isList(caOption)) {
        return caOption.toArray().map(function(x) {
            return fs.readFileSync(x);
        });
    }
}

function getKey(options) {
    return fs.readFileSync(
        options.getIn(["https", "key"]) || join(certPath, "server.key")
    );
}

function getCert(options) {
    return fs.readFileSync(
        options.getIn(["https", "cert"]) || join(certPath, "server.crt")
    );
}

function getHttpsServerDefaults(options) {
    return fromJS({
        key: getKey(options),
        cert: getCert(options),
        ca: getCa(options),
        passphrase: options.getIn(["https", "passphrase"], "")
    });
}

function getPFXDefaults(options) {
    return fromJS({
        pfx: fs.readFileSync(options.getIn(["https", "pfx"]))
    });
}

var serverUtils = {
    /**
     * @param options
     * @returns {{key, cert}}
     */
    getHttpsOptions: function(options) {
        var userOption = options.get("https");
        if (Map.isMap(userOption)) {
            if (userOption.has("pfx")) {
                return userOption.mergeDeep(getPFXDefaults(options));
            }
            return userOption.mergeDeep(getHttpsServerDefaults(options));
        }
        return getHttpsServerDefaults(options);
    },
    /**
     * Get either http or https server
     * or use the httpModule provided in options if present
     */
    getServer: function(app, options) {
        return {
            server: (function() {
                const serverFactory = serverUtils.getServerFactory(options);

                if (
                    options.get("scheme") === "https"
                ) {
                    var opts = serverUtils.getHttpsOptions(options);
                    return serverFactory(opts.toJS(), app);
                }

                return serverFactory(app);
            })(),
            app: app
        };
    },
    getServerFactory: function(options) {
        /**
         * Users may provide a string to be used by node's
         * require lookup.
         */
        const httpModuleOption = options.get("httpModule");
        let httpModule;
        if (typeof httpModuleOption === "string") {
            /**
             * Note, this could throw, but let that happen as
             * the error message good enough.
             */
            var maybe = require.resolve(httpModuleOption);
            httpModule = require(maybe);
        }
        else if (options.get("scheme") === "https") {
            httpModule = https;
        }
        else {
            httpModule = http;
        }

        const secure =
            options.get("scheme") === "https" ||
            // for backwards-compatibility, we assume that if http2 then
            // also using TLS (most browsers don't support non-secure http2)
            httpModuleOption === "http2";
        if (secure && typeof httpModule.createSecureServer === 'function') {
            // e.g. node's native http2 module has a separate createSecureServer method:
            return httpModule.createSecureServer.bind(httpModule);
        }
        else {
            return httpModule.createServer.bind(httpModule);
        }
    },
    getMiddlewares: function(bs) {
        var clientJs = bs.pluginManager.hook("client:js", {
            port: bs.options.get("port"),
            options: bs.options
        });

        var scripts = bs.pluginManager.get("client:script")(
            bs.options.toJS(),
            clientJs,
            "middleware"
        );

        var defaultMiddlewares = [
            {
                id: "Browsersync HTTP Protocol",
                route: require("../config").httpProtocol.path,
                handle: require("../http-protocol").middleware(bs)
            },
            {
                id: "Browsersync IE8 Support",
                route: "",
                handle: snippet.isOldIe(
                    bs.options.get("excludedFileTypes").toJS()
                )
            },
            {
                id: "Browsersync Response Modifier",
                route: "",
                handle: serverUtils.getSnippetMiddleware(bs)
            },
            {
                id: "Browsersync Client - versioned",
                route: bs.options.getIn(["scriptPaths", "versioned"]),
                handle: scripts
            },
            {
                id: "Browsersync Client",
                route: bs.options.getIn(["scriptPaths", "path"]),
                handle: scripts
            }
        ];

        /**
         * Add cors middleware to the front of the stack
         * if a user provided a 'cors' flag
         */
        if (bs.options.get("cors")) {
            defaultMiddlewares.unshift({
                id: "Browsersync CORS support",
                route: "",
                handle: serverUtils.getCorsMiddlewware()
            });
        }

        /**
         * Add connect-history-api-fallback if 'single' argument given
         */
        if (bs.options.get("single")) {
            defaultMiddlewares.unshift({
                id: "Browsersync SPA support",
                route: "",
                handle: require("connect-history-api-fallback")()
            });
        }

        /**
         * Add serve static middleware
         */
        if (bs.options.get("serveStatic")) {
            var ssMiddlewares = serverUtils.getServeStaticMiddlewares(
                bs.options.get("serveStatic"),
                bs.options.get("serveStaticOptions", Immutable.Map({})).toJS()
            );
            var withErrors = ssMiddlewares.filter(function(x) {
                return x.get("errors").size > 0;
            });
            var withoutErrors = ssMiddlewares.filter(function(x) {
                return x.get("errors").size === 0;
            });

            if (withErrors.size) {
                withErrors.forEach(function(item) {
                    logger.logger.error(
                        "{red:Warning!} %s",
                        item.getIn(["errors", 0, "data", "message"])
                    );
                });
            }

            if (withoutErrors.size) {
                withoutErrors.forEach(function(item) {
                    defaultMiddlewares.push.apply(
                        defaultMiddlewares,
                        item.get("items").toJS()
                    );
                });
            }
        }

        /**
         * Add user-provided middlewares
         */
        var userMiddlewares = bs.options
            .get("middleware")
            .map(normaliseMiddleware)
            .toArray();
        var beforeMiddlewares = userMiddlewares.filter(function(x) {
            return x.override;
        });
        var afterMiddlewares = userMiddlewares
            .filter(function(x) {
                return !x.override;
            })
            .concat(
                bs.options.get("mode") !== "proxy" &&
                    userMiddlewares.length === 0 && {
                        id: "Browsersync 404/index support",
                        route: "",
                        handle: serveIndex(bs.options.get("cwd"), {
                            icons: true,
                            view: "details"
                        })
                    }
            );

        const mwStack = []
            .concat(beforeMiddlewares, defaultMiddlewares, afterMiddlewares)
            .filter(Boolean);

        return mwStack;

        function normaliseMiddleware(item) {
            /**
             * Object given in options, which
             * ended up being a Map
             */
            if (Map.isMap(item)) {
                return item.toJS();
            }
            /**
             * Single function
             */
            if (typeof item === "function") {
                return {
                    route: "",
                    handle: item
                };
            }
            /**
             * Plain obj
             */
            if (item.route !== undefined && item.handle) {
                return item;
            }
        }
    },
    getBaseApp: function(bs) {
        var app = connect();
        var middlewares = serverUtils.getMiddlewares(bs);

        /**
         * Add all internal middlewares
         */
        middlewares.forEach(function(item) {
            app.stack.push(item);
        });

        return app;
    },
    getSnippetMiddleware: function(bs) {
        var rules = [];
        var blacklist = List([])
            .concat(bs.options.getIn(["snippetOptions", "ignorePaths"]))
            .concat(bs.options.getIn(["snippetOptions", "blacklist"]))
            .filter(Boolean);

        var whitelist = List([]).concat(
            bs.options.getIn(["snippetOptions", "whitelist"])
        );

        // Snippet
        if (bs.options.get("snippet")) {
            rules.push(
                snippetUtils.getRegex(
                    bs.options.get("snippet"),
                    bs.options.get("snippetOptions")
                )
            );
        }

        // User
        bs.options.get("rewriteRules").forEach(function(rule) {
            if (Map.isMap(rule)) {
                rules.push(rule.toJS());
            }
            if (_.isPlainObject(rule)) {
                rules.push(rule);
            }
        });

        // Proxy
        if (bs.options.get("proxy")) {
            var proxyRule = require("./proxy-utils").rewriteLinks(
                bs.options.getIn(["proxy", "url"]).toJS()
            );
            rules.push(proxyRule);
        }

        var lr = lrSnippet.create({
            rules: rules,
            blacklist: blacklist.toArray(),
            whitelist: whitelist.toArray()
        });

        return lr.middleware;
    },
    getCorsMiddlewware: function() {
        return function(req, res, next) {
            // Website you wish to allow to connect
            res.setHeader("Access-Control-Allow-Origin", "*");

            // Request methods you wish to allow
            res.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, OPTIONS, PUT, PATCH, DELETE"
            );

            // Request headers you wish to allow
            res.setHeader(
                "Access-Control-Allow-Headers",
                "X-Requested-With,content-type"
            );

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader("Access-Control-Allow-Credentials", true);
            next();
        };
    },
    /**
     * @param ssOption
     * @param serveStaticOptions
     * @returns {*}
     */
    getServeStaticMiddlewares: function(ssOption, serveStaticOptions) {
        return ssOption.map(function(dir, i) {
            /**
             * When a user gives a plain string only, eg:
             *   serveStatic: ['./temp']
             *     ->
             *       This means a middleware will be created with
             *         route: ''
             *         handle: serveStatic('./temp', options)
             */
            if (_.isString(dir)) {
                return getFromString(dir);
            }

            /**
             * If a user gave an object eg:
             *   serveStatic: [{route: "", dir: ["test", "./tmp"]}]
             *     ->
             *       This means we need to create a middle for each route + dir combo
             */
            if (Immutable.Map.isMap(dir)) {
                return getFromMap(dir, i);
            }

            /**
             * At this point, an item in the serveStatic array was not a string
             * or an object so we return an error that can be logged
             */
            return fromJS({
                items: [],
                errors: [
                    {
                        type: "Invalid Type",
                        data: {
                            message:
                                "Only strings and Objects (with route+dir) are supported for the ServeStatic option"
                        }
                    }
                ]
            });
        });

        /**
         * @param {string} x
         * @returns {string}
         */
        function getRoute(x) {
            if (x === "") return "";
            return x[0] === "/" ? x : "/" + x;
        }

        /**
         * @param dir
         * @returns {Map}
         */
        function getFromString(dir) {
            return fromJS({
                items: [
                    {
                        route: "",
                        handle: serveStatic(dir, serveStaticOptions)
                    }
                ],
                errors: []
            });
        }

        /**
         * @param dir
         * @returns {Map}
         */
        function getFromMap(dir) {
            var ssOptions = (function() {
                if (dir.get("options")) {
                    return dir.get("options").toJS();
                }
                return {};
            })();

            var route = Immutable.List([])
                .concat(dir.get("route"))
                .filter(_.isString);
            var _dir = Immutable.List([])
                .concat(dir.get("dir"))
                .filter(_.isString);

            if (_dir.size === 0) {
                return fromJS({
                    items: [],
                    errors: [
                        {
                            type: "Invalid Object",
                            data: {
                                message:
                                    "Serve Static requires a 'dir' property when using an Object"
                            }
                        }
                    ]
                });
            }

            var ssItems = (function() {
                /**
                 * iterate over every 'route' item
                 * @type {Immutable.List<any>|Immutable.List<*>|Immutable.List<any>|*}
                 */
                var routeItems = (function() {
                    /**
                     * If no 'route' was given, assume we want to match all
                     * paths
                     */
                    if (route.size === 0) {
                        return _dir.map(function(dirString) {
                            return Map({
                                route: "",
                                dir: dirString
                            });
                        });
                    }

                    return route.reduce(function(acc, routeString) {
                        /**
                         * For each 'route' item, also iterate through 'dirs'
                         * @type {Immutable.Iterable<K, M>}
                         */
                        var perDir = _dir.map(function(dirString) {
                            return Map({
                                route: getRoute(routeString),
                                dir: dirString
                            });
                        });
                        return acc.concat(perDir);
                    }, List([]));
                })();

                /**
                 * Now create a serverStatic Middleware for each item
                 */
                return routeItems.map(function(routeItem) {
                    return routeItem.merge({
                        handle: serveStatic(routeItem.get("dir"), ssOptions)
                    });
                });
            })();

            return fromJS({
                items: ssItems,
                errors: []
            });
        }
    }
};

module.exports = serverUtils;
