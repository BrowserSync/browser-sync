"use strict";

var fs           = require("fs");
var filePath     = require("path");
var connect      = require("connect");
var http         = require("http");
var https        = require("https");
var snippet      = require("./../snippet").utils;

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

        /**
         * Add the proxy Middleware to the end of the stack
         */
        app.stack.push(
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
        );

        /**
         * Add user-provided middlewares
         */
        options.get("middleware").forEach(function (item) {
            if (typeof item === "function") {
                return app.use(item);
            }
            if ((item.route !== undefined) && item.handle) {
                app.stack.push(item);
            }
        });

        return app;
    },
    getSnippetMiddleware: function (bs) {
        if (bs.options.get("proxy")) {
            var rule = require("./proxy-utils").rewriteLinks(bs.options.getIn(["proxy", "url"]).toJS());
            bs.snippetMw.opts.rules.push(rule);
        }
        return bs.snippetMw.middleware;
    }
};

module.exports = utils;
