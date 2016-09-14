"use strict";

var fs        = require("fs");
var filePath  = require("path");
var connect   = require("connect");
var http      = require("http");
var https     = require("https");
var Map       = require("immutable").Map;
var snippet   = require("./../snippet").utils;

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
    }
};

module.exports = utils;
