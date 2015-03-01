"use strict";

var fs           = require("fs");
var filePath     = require("path");
var serveIndex   = require("serve-index");
var serveStatic  = require("serve-static");
var _            = require("lodash");
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
     * @param index
     */
    addBaseDir: function (app, base, index) {

        if (isList(base)) {
            base.forEach(function (item) {
                app.use(serveStatic(filePath.resolve(item), {index: index}));
            });
        } else {
            if (_.isString(base)) {
                app.use(serveStatic(filePath.resolve(base), {index: index}));
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
                return options.get("scheme") === "https"
                    ? https.createServer(utils.getKeyAndCert(options), app)
                    : http.createServer(app);
            })(),
            app: app
        };
    }
};

module.exports = utils;
