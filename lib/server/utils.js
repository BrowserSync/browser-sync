"use strict";

var filePath     = require("path");
var serveIndex   = require("serve-index");
var serveStatic  = require("serve-static");
var _            = require("lodash");
var snippetUtils = require("./../snippet").utils;

module.exports =  {
    /**
     * The middleware that can emit location change events.
     * @param {Object} io
     * @param {Object} options
     * @returns {Function}
     */
    navigateCallback: function (io, options) {

        var disabled = false;
        var navigating = false;
        var canNavigate = this.canNavigate;

        return function (req, res, next) {

            if (canNavigate(req, options, io)) {

                var clients = io.sockets.clients();

                if (clients.length && !disabled && !navigating) {

                    navigating = true;
                    disabled = true;

                    io.sockets.emit("location", {
                        url: req.url
                    });

                    var timer = setTimeout(function () {

                        disabled = false;
                        navigating = false;
                        clearInterval(timer);

                    }, 300);
                }
            }
            if (typeof next === "function") {
                next();
            }
        };
    },
    /**
     * All the conditions that determine if we should emit
     * a location:change event
     * @param {Object} req
     * @param {Object} options
     * @returns {Boolean}
     */
    canNavigate: function (req, options) {

        var headers = req.headers || {};

        if (req.method !== "GET") {
            return false;
        }

        if (headers["x-requested-with"] !== undefined && headers["x-requested-with"] === "XMLHttpRequest") {
            return false;
        }

        if (!options || !options.ghostMode || !options.ghostMode.location) {
            return false;
        }

        if (snippetUtils.isExcluded(req.url, options.excludedFileTypes)) {
            return false;
        }

        return true;
    },
    /**
     * @param app
     * @param middleware
     * @returns {*}
     */
    addMiddleware: function (app, middleware) {

        if (Array.isArray(middleware)) {
            middleware.forEach(function (item) {
                app.use(item);
            });
        } else if (typeof middleware === "function") {
            app.use(middleware);
        }

        return app;
    },
    /**
     * @param app
     * @param base
     * @param index
     */
    addBaseDir: function (app, base, index) {
        if (Array.isArray(base)) {
            base.forEach(function (item) {
                app.use(serveStatic(filePath.resolve(item)));
            });
        } else {
            if ("string" === typeof base) {
                app.use(serveStatic(filePath.resolve(base), { index: index }));
            }
        }
    },
    /**
     * @param app
     * @param base
     */
    addDirectory: function (app, base) {
        if (Array.isArray(base)) {
            base = base[0];
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
    }
};