"use strict";

var fs          = require("fs");
var filePath    = require("path");
var connect     = require("connect");
var Immutable   = require("immutable");
var http        = require("http");
var https       = require("https");
var Map         = require("immutable").Map;
var snippet     = require("./../snippet").utils;
var _           = require("./../../lodash.custom");
var serveStatic = require("serve-static");
var logger      = require("../logger");

var utils = {
    /**
     * @param options
     * @returns {{key, cert}}
     */
    getKeyAndCert: function (options) {
        return {
            key:  fs.readFileSync(options.getIn(["https", "key"])  || filePath.join(__dirname, "certs/server.key")),
            cert: fs.readFileSync(options.getIn(["https", "cert"]) || filePath.join(__dirname, "certs/server.crt"))
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
     * Get either an http or https server
     */
    getServer: function (app, options) {
        return {
            server: (function () {
                if (options.get("scheme") === "https") {
                    var pfxPath = options.getIn(["https", "pfx"]);
                    return pfxPath ?
                        https.createServer(utils.getPFX(pfxPath), app) :
                        https.createServer(utils.getKeyAndCert(options), app);
                }
                return http.createServer(app);
            })(),
            app: app
        };
    },
    getBaseApp: function (bs, options, scripts) {

        var app  = connect();
        var defaultMiddlewares = [
            {
                id: "Browsersync IE8 Support",
                route: "",
                handle: snippet.isOldIe(options.get("excludedFileTypes").toJS())
            },
            {
                id: "Browsersync Response Modifier",
                route: "",
                handle: utils.getSnippetMiddleware(bs)
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

        if (options.get("cors")) {
            defaultMiddlewares.unshift({
                id: "Browsersync CORS support",
                route: "",
                handle: utils.getCorsMiddlewware()
            })
        }

        if (options.get("serveStatic")) {

            var ssMiddlewares = utils.getServeStaticMiddlewares(options.get("serveStatic"), options.get("serveStaticOptions", Immutable.Map({})).toJS());
            var withErrors    = ssMiddlewares.filter(function(x) { return x.errors.length > 0 });
            var withoutErrors = ssMiddlewares.filter(function(x) { return x.errors.length === 0 });

            if (withErrors.size) {
                withErrors.forEach(function (item) {
                    logger.logger.error("{red:Warning!} %s", item.errors[0].data.message);
                });
            }

            if (withoutErrors.size) {
                withoutErrors.forEach(function (item) {
                    defaultMiddlewares.push.apply(defaultMiddlewares, item.items);
                });
            }
        }

        /**
         * Add the proxy Middleware to the end of the stack
         */

        app.stack.push.apply(app.stack, defaultMiddlewares);

        /**
         * Add user-provided middlewares
         */
        options.get("middleware")
            .map(function (item) {
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
            })
            .forEach(function (item) {
                /**
                 * Add each middleware
                 */
                app.stack.push(item);
            });

        return app;
    },
    getSnippetMiddleware: function (bs) {
        if (bs.options.get("proxy")) {
            var rule = require("./proxy-utils").rewriteLinks(bs.options.getIn(["proxy", "url"]).toJS());
            bs.snippetMw.opts.rules.push(rule);
        }
        return bs.snippetMw.middleware;
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
    getServeStaticMiddlewares: function (ssOption, serveStaticOptions) {

        return ssOption.map(function (dir, i) {

            if (Immutable.Map.isMap(dir)) {

                var ssOptions = (function () {
                    if (dir.get("options")) {
                        return dir.get("options").toJS();
                    }
                    return {}
                })();

                var route = dir.get("route");
                var _dir  = dir.get("dir");

                if (!isValidOption(route) || !isValidOption(_dir)) {
                    return {
                        items: [],
                        errors: [{
                            type: "Invalid Object",
                            data: {
                                message: "Serve Static requires both 'route' and 'dir' options when using an Object"
                            }
                        }]
                    }
                }

                var ssItems = (function () {
                    if (_.isString(route)) {
                        return [{
                            id: "Serve static " + i,
                            route: getRoute(route),
                            handle: serveStatic(_dir, ssOptions)
                        }]
                    }
                    return route.map(function (item, j) {
                        return {
                            id: "Serve static " + i + "." + j,
                            route: getRoute(item),
                            handle: serveStatic(_dir, ssOptions)
                        }
                    }).toJS()
                })();
                return {
                    items: ssItems,
                    errors: []
                };
            }

            if (_.isString(dir)) {
                return {
                    items: [
                        {
                            id: "Serve static " + i,
                            route: "",
                            handle: serveStatic(dir, serveStaticOptions)
                        }
                    ],
                    errors: []
                }
            }

            return {
                items: [],
                errors: [{
                    type: "Invalid Type",
                    data: {
                        message: "Only strings and Objects (with route+dir) are supported for the ServeStatic option"
                    }
                }]
            }
        });
        function isValidOption (x) {
            return _.isString(x) || (_.isArray(x) && x.length > 0) || (Immutable.List.isList(x) && x.size > 0);
        }
        function getRoute (x) {
            if (x === '') return '';
            return x[0] === "/" ? x : "/" + x;
        }
    }
};

module.exports = utils;
