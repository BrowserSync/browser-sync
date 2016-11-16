"use strict";

var fs           = require("fs");
var path         = require("path");
var filePath     = require("path");
var connect      = require("connect");
var Immutable    = require("immutable");
var http         = require("http");
var https        = require("https");
var Map          = require("immutable").Map;
var fromJS       = require("immutable").fromJS;
var List         = require("immutable").List;
var snippet      = require("./../snippet").utils;
var _            = require("./../../lodash.custom");
var serveStatic  = require("serve-static");
var logger       = require("../logger");
var snippetUtils = require("../snippet").utils;
var lrSnippet    = require("resp-modifier");
var utils        = require("../utils");

var serverUtils = {
    /**
     * @param options
     * @returns {{key, cert}}
     */
    getKeyAndCert: function (options) {
        return {
            key: fs.readFileSync(options.getIn(["https", "key"])  || filePath.join(__dirname, "certs/server.key")),
            cert: fs.readFileSync(options.getIn(["https", "cert"]) || filePath.join(__dirname, "certs/server.crt")),
            ca: fs.readFileSync(options.getIn(["https", "ca"]) || filePath.join(__dirname, "certs/server.csr")),
            passphrase: options.getIn(["https", "passphrase"]) || ""
        };
    },
    /**
     * @param filePath
     * @returns {{pfx}}
     */
    getPFX: function (filePath) {
        return {
            pfx: fs.readFileSync(filePath)
        };
    },
    /**
     * Get either http or https server
     * or use the httpModule provided in options if present
     */
    getServer: function (app, options) {
        return {
            server: (function () {

                var httpModule = serverUtils.getHttpModule(options);

                if (options.get("scheme") === "https") {
                    var pfxPath = options.getIn(["https", "pfx"]);
                    return pfxPath ?
                        httpModule.createServer(serverUtils.getPFX(pfxPath), app) :
                        httpModule.createServer(serverUtils.getKeyAndCert(options), app);
                }

                return httpModule.createServer(app);
            })(),
            app: app
        };
    },
    getHttpModule: function (options) {
        /**
         * Users may provide a string to be used by nodes
         * require lookup.
         */
        var httpModule = options.get("httpModule");

        if (typeof httpModule === "string") {
            /**
             * Note, this could throw, but let that happen as
             * the error message good enough.
             */
            var maybe = path.resolve(process.cwd(), "node_modules", httpModule);
            return require(maybe);
        }

        if (options.get("scheme") === "https") {
            return https;
        }

        return http;
    },
    getMiddlewares: function (bs) {

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
                handle: snippet.isOldIe(bs.options.get("excludedFileTypes").toJS())
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
            })
        }

        /**
         * Add serve static middleware
         */
        if (bs.options.get("serveStatic")) {

            var ssMiddlewares = serverUtils.getServeStaticMiddlewares(bs.options.get("serveStatic"), bs.options.get("serveStaticOptions", Immutable.Map({})).toJS());
            var withErrors    = ssMiddlewares.filter(function(x) { return x.get("errors").size > 0 });
            var withoutErrors = ssMiddlewares.filter(function(x) { return x.get("errors").size === 0 });

            if (withErrors.size) {
                withErrors.forEach(function (item) {
                    logger.logger.error("{red:Warning!} %s", item.getIn(["errors", 0, "data", "message"]));
                });
            }

            if (withoutErrors.size) {
                withoutErrors.forEach(function (item) {
                    defaultMiddlewares.push.apply(defaultMiddlewares, item.get("items").toJS());
                });
            }
        }

        /**
         * Add user-provided middlewares
         */
        var userMiddlewares   = bs.options.get("middleware").map(normaliseMiddleware).toArray();
        var beforeMiddlewares = userMiddlewares.filter(function (x) { return x.override; });
        var afterMiddlewares  = userMiddlewares.filter(function (x) { return !x.override; });

        return [].concat(beforeMiddlewares, defaultMiddlewares, afterMiddlewares);

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
                }
            }
            /**
             * Plain obj
             */
            if ((item.route !== undefined) && item.handle) {
                return item;
            }
        }

                /**
         * Add the proxy Middleware to the end of the stack
         */
    },
    getBaseApp: function (bs) {

        var app         = connect();
        var middlewares = serverUtils.getMiddlewares(bs);

        /**
         * Add all internal middlewares
         */
        middlewares.forEach(function (item) {
            app.stack.push(item);
        });

        return app;
    },
    getSnippetMiddleware: function (bs) {

        var rules = [];
        var blacklist = List([])
            .concat(bs.options.getIn(["snippetOptions", "ignorePaths"]))
            .concat(bs.options.getIn(["snippetOptions", "blacklist"]))
            .filter(Boolean);

        var whitelist = List([])
            .concat(bs.options.getIn(["snippetOptions", "whitelist"]));

        // Snippet
        rules.push(snippetUtils.getRegex(bs.options.get("snippet"), bs.options.get("snippetOptions")));

        // User
        bs.options.get("rewriteRules").forEach(function (rule) {
            if (Map.isMap(rule)) {
                rules.push(rule.toJS());
            }
            if (_.isPlainObject(rule)) {
                rules.push(rule);
            }
        });

        // Proxy
        if (bs.options.get("proxy")) {
            var proxyRule = require("./proxy-utils").rewriteLinks(bs.options.getIn(["proxy", "url"]).toJS());
            rules.push(proxyRule);
        }

        var lr = lrSnippet.create({
            rules:     rules,
            blacklist: blacklist.toArray(),
            whitelist: whitelist.toArray()
        });

        return lr.middleware;
    },
    getCorsMiddlewware: function () {

        return function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader("Access-Control-Allow-Origin", "*");

            // Request methods you wish to allow
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

            // Request headers you wish to allow
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader("Access-Control-Allow-Credentials", true);
            next();
        }
    },
    /**
     * @param ssOption
     * @param serveStaticOptions
     * @returns {*}
     */
    getServeStaticMiddlewares: function (ssOption, serveStaticOptions) {

        return ssOption.map(function (dir, i) {

            /**
             * When a user gives a plain string only, eg:
             *   serveStatic: ['./temp']
             *     ->
             *       This means a middleware will be created with
             *         route: ''
             *         handle: serveStatic('./temp', options)
             */
            if (_.isString(dir)) {
                return getFromString(dir)
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
                errors: [{
                    type: "Invalid Type",
                    data: {
                        message: "Only strings and Objects (with route+dir) are supported for the ServeStatic option"
                    }
                }]
            })
        });

        /**
         * @param {string} x
         * @returns {string}
         */
        function getRoute (x) {
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
            })
        }

        /**
         * @param dir
         * @returns {Map}
         */
        function getFromMap(dir) {

            var ssOptions = (function () {
                if (dir.get("options")) {
                    return dir.get("options").toJS();
                }
                return {}
            })();

            var route = Immutable.List([]).concat(dir.get("route")).filter(_.isString);
            var _dir  = Immutable.List([]).concat(dir.get("dir")).filter(_.isString);

            if (_dir.size === 0) {

                return fromJS({
                    items: [],
                    errors: [{
                        type: "Invalid Object",
                        data: {
                            message: "Serve Static requires a 'dir' property when using an Object"
                        }
                    }]
                })
            }

            var ssItems = (function () {

                /**
                 * iterate over every 'route' item
                 * @type {Immutable.List<any>|Immutable.List<*>|Immutable.List<any>|*}
                 */
                var routeItems = (function () {

                    /**
                     * If no 'route' was given, assume we want to match all
                     * paths
                     */
                    if (route.size === 0) {
                        return _dir.map(function (dirString) {
                            return Map({
                                route: "",
                                dir: dirString
                            });
                        });
                    }

                    return route.reduce(function (acc, routeString) {
                        /**
                         * For each 'route' item, also iterate through 'dirs'
                         * @type {Immutable.Iterable<K, M>}
                         */
                        var perDir = _dir.map(function (dirString) {
                            return Map({
                                route: getRoute(routeString),
                                dir: dirString
                            })
                        });
                        return acc.concat(perDir);

                    }, List([]));
                })();

                /**
                 * Now create a serverStatic Middleware for each item
                 */
                return routeItems.map(function (routeItem) {
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
