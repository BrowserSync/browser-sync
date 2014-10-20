"use strict";

var messages = require("./messages");
var utils    = require("./utils");

var _        = require("lodash");

var template = "[{blue:%s}] ";

var logger   = require("eazy-logger").Logger({
    prefix: template.replace("%s", "BS"),
    useLevelPrefixes: false
});

module.exports.logger = logger;

/**
 * @param name
 * @returns {*}
 */
module.exports.getLogger = function (name) {
    return logger.clone(function (config) {
        config.prefix = config.prefix + template.replace("%s", name);
        return config;
    });
};

/**
 * Logging Callbacks
 */
module.exports.callbacks = {
    /**
     * Log when file-watching has started
     * @param options
     * @param data
     */
    "file:watching": function (options, data) {
        if (Object.keys(data).length) {
            logger.info("Watching files...");
        }
    },
    /**
     * Log when a file changes
     * @param options
     * @param data
     */
    "file:reload": function (options, data) {
        if (data.log) {
            var path = utils.resolveRelativeFilePath(data.path, data.cwd);
            logger.info("{cyan:File changed: {magenta:%s", path);
        }
    },
    /**
     *
     */
    "service:exit": function () {
        logger.debug("Exiting...");
    },
    /**
     *
     */
    "browser:reload": function () {
        logger.info("{cyan:Reloading Browsers...");
    },
    /**
     * @param options
     * @param data
     */
    "config:error": function (options, data) {
        logger.setOnce("useLevelPrefixes", true).error(data.msg);
    },
    /**
     * @param options
     * @param data
     */
    "config:warn": function (options, data) {
        logger.setOnce("useLevelPrefixes", true).warn(data.msg);
    },
    /**
     * @param options
     * @param data
     */
    "stream:changed": function (options, data) {

        var changed = data.changed;

        logger.info("{cyan:%s %s changed} ({magenta:%s})",
            changed.length,
            changed.length > 1 ? "files" : "file",
            changed.join(", ")
        );
    },
    /**
     * Client connected logging
     * @param options
     * @param data
     */
    "client:connected": function (options, data) {

        var uaString = utils.getUaString(data.ua);
        var msg = "{cyan:Browser Connected: {magenta:%s, version: %s}";
        var method = "info";

        if (!options.logConnections) {
            method = "debug";
        }

        logger.log(method, msg,
            uaString.name,
            uaString.version
        );
    },
    /**
     * Main logging when the service is running
     * @param options
     * @param data
     */
    "service:running": function (options, data) {

        var type    = data.type;
        var baseDir = options.server.baseDir;
        var proxy   = options.proxy;

        if (type === "server") {

            logUrls(options.urls);

            if (baseDir) {
                if (Array.isArray(baseDir)) {
                    _.each(baseDir, serveFiles);
                } else {
                    serveFiles(baseDir);
                }
            }
        }

        if (type === "proxy") {

            logger.info("Proxying: {cyan:%s}", proxy.target);
            logger.info("Now you can access your site through the following addresses:");
            logUrls(options.urls);
        }

        if (type === "snippet" && options.logSnippet) {

            logger.info(
                "Copy the following snippet into your website, " +
                "just before the closing {cyan:</body>} tag"
            );
            logger.unprefixed("info",
                messages.scriptTags(options.port, options)
            );
        }

        function serveFiles (base) {
            logger.info("Serving files from: {magenta:%s}", base);
        }

        function logUrls (urls) {
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

    // Should set logger level here!
    if (options.logLevel === "silent") {
        logger.mute(true);
    } else {
        logger.setLevel(options.logLevel);
    }

    if (options.logPrefix) {
        if (_.isFunction(options.logPrefix)) {
            logger.setPrefix(options.logPrefix);
        } else {
            logger.setPrefix(template.replace("%s", options.logPrefix));
        }
    }

    _.each(exports.callbacks, function (func, event) {
        emitter.on(event, func.bind(this, options));
    });

    return logger;
};
