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

/**
 * Logging Callbacks
 * @type {{file:watching: "file:watching", file:reload: "file:reload", client:connected: "client:connected", open: "open"}}
 */
module.exports.callbacks = {

    "file:watching": function (options, data) {
//        if (data.watcher._patterns) {
//            log("info", messages.files.watching(data.watcher._patterns), options);
//        }
    },
    "file:reload": function (options, data) {
//        if (data.log) {
//            log("info", messages.files.changed(utils.resolveRelativeFilePath(data.path, data.cwd)), options);
//            log("info", messages.browser[data.type](), options);
//        }
    },
    "stream:changed": function (options, data) {

//        var changed = data.changed;
//        var msg;
//
//        if (!changed.length) {
//            msg = messages.stream.once();
//        } else {
//
//            msg = messages.stream.multi(changed);
//        }
//
//        log("info", msg, options);
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