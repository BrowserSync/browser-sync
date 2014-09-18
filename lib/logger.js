"use strict";

var messages = require("./messages");
var multi    = require("multiline");
var utils    = require("./utils").utils;
//var log      = utils.log;

var logger   = require("eazy-logger").Logger({
    prefix: "{blue:[}{white:BS}{blue:] }",
    useLevelPrefixes: false
});

var _        = require("lodash");

module.exports.logger = logger;

/**
 * Logging Callbacks
 */
module.exports.callbacks = {
    "file:watching": function (options, data) {
        logger.info("Watching files...");
    },
    "file:reload": function (options, data) {
        if (data.log) {
            var path = utils.resolveRelativeFilePath(data.path, data.cwd);
            logger.info("{cyan:File changed: {magenta:%s", path);
        }
    },
    "stream:changed": function (options, data) {

//        var changed = data.changed;
        var changed = ['changes.txt'];
        var msg;

        if (!changed.length) {
            logger.info("{cyan:Files changed: {magenta:%s", changed);
        } else {
            logger.info("{cyan:%s file%s changed} ({magenta:%s})",
                changed.length,
                changed.length > 1 ? "s" : "",
                changed.join(", ")
            );
        }
    },
    "client:connected": function (options, data) {

//        var msg;
//        var uaString = utils.getUaString(data.ua);
//
//        if (options.logConnections) {
//            msg = messages.browser.connection(uaString, true);
//            log("info", msg, options, false);
//        } else {
//            msg = messages.browser.connection(uaString);
//            log("debug", msg, options, false);
//        }
    },
    "service:running": function (options, data) {

        var type = data.type;
        var baseDir = options.server.baseDir;
        var proxy   = options.proxy;

        if (data.tunnel) {
            options.urls.tunnel = data.tunnel;
        }

        if (type === "server") {

            logUrls(options.urls);

            if (baseDir) {
                Array.isArray(baseDir)
                    ? _.each(baseDir, serveFiles)
                    : serveFiles(baseDir);
            }
        }

        function serveFiles(base){
            logger.info("Serving files from: {magenta:%s}", base);
        }

        if (type === "proxy") {

            logger.info("Proxying: {cyan:%s}", proxy.target);
            logger.info("Now you can access your site through the following addresses:");
            logUrls(options.urls);
        }

        if (type === "snippet") {

            logger.info("Copy the following snippet into your website, just before the closing {cyan:</body>} tag");
            logger.unprefixed("info",
                messages.scriptTags(options.port, options)
            );
        }

        function logUrls(urls) {
            _.each(urls, function (value, key) {
                logger.info("%s URL: {magenta:%s}",
                    utils.ucfirst(key),
                    value);
            });
        }
    }
};

/**
 * Plugin interface - only to be called once to register all events
 */
module.exports.plugin = function (emitter, options) {
    _.each(exports.callbacks, function (func, event) {
        emitter.on(event, func.bind(this, options));
    });
};