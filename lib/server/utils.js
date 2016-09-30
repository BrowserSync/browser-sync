"use strict";

var fs          = require("fs");
var filePath    = require("path");
var connect     = require("connect");
var Immutable   = require("immutable");
var http        = require("http");
var https       = require("https");
var Map         = require("immutable").Map;
var fromJS      = require("immutable").fromJS;
var List        = require("immutable").List;
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

        /**
         * Add cors middleware to the front of the stack
         * if a user provided a 'cors' flag
         */
        if (options.get("cors")) {
            defaultMiddlewares.unshift({
                id: "Browsersync CORS support",
                route: "",
                handle: utils.getCorsMiddlewware()
            })
        }

        /**
         * Add serve static middleware
         */
        if (options.get("serveStatic")) {
            var ssMiddlewares = utils.getServeStaticMiddlewares(options.get("serveStatic"), options.get("serveStaticOptions", Immutable.Map({})).toJS());
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

module.exports = utils;
