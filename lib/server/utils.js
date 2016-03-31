"use strict";

var fs           = require("fs");
var filePath     = require("path");
var serveIndex   = require("serve-index");
var serveStatic  = require("serve-static");
var _            = require("lodash");
var connect      = require("connect");
var http         = require("http");
var https        = require("https");
var Immutable    = require("immutable");
var isList       = Immutable.List.isList;
var snippetUtils = require("./../snippet").utils;

var utils = {
    /**
     * @param app
     * @param middleware
     * @returns {*}
     */
    addMiddleware: function (app, middleware) {

        middleware.forEach(function (item) {
            app.use(item);
        });

        return app;
    },
    /**
     * @param app
     * @param base
     * @param opts
     */
    addBaseDir: function (app, base, opts) {

        opts = opts.toJS();

        if (isList(base)) {
            base.forEach(function (item) {
                app.use(serveStatic(filePath.resolve(item), opts));
            });
        } else {
            if (_.isString(base)) {
                app.use(serveStatic(filePath.resolve(base), opts));
            }
        }
    },
    /**
     * @param app
     * @param base
     */
    addDirectory: function (app, base) {
        if (isList(base)) {
            base = base.get(0);
        }
        app.use(serveIndex(filePath.resolve(base), {icons:true}));
    },
    /**
     * @param app
     * @param {Object} routes
     */
    addRoutes: function (app, routes) {
        Object.keys(routes).forEach(function (key) {
            if (_.isString(key) && _.isString(routes[key])) {
                app.use(key, serveStatic(filePath.resolve(routes[key])));
            }
        });
    },
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
     * @param req
     * @param res
     * @param next
     * @returns {*}
     */
    handleOldIE: function (req, res, next) {
        snippetUtils.isOldIe(req);
        return next();
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
    getBaseApp: function (bs, scripts) {

        var app  = connect();
        var rule = require("./proxy-utils").rewriteLinks(bs.options.getIn(["proxy", "url"]).toJS());

        bs.snippetMw.opts.rules.push(rule);

        /**
         * Add the snippet middleware to the front of the stack
         */
        app.use(bs.snippetMw.middleware);

        /**
         * Serve the Client-side JS from both version and static paths
         */
        app.use(bs.options.getIn(["scriptPaths", "versioned"]), scripts)
            .use(bs.options.getIn(["scriptPaths", "path"]),     scripts);

        /**
         * Add user-provided middlewares
         */
        bs.options.get("middleware").forEach(function (item) {
            app.use(item);
        });

        return app;
    }
};

module.exports = utils;
