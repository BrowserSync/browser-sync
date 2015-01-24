"use strict";

var messages  = require("./connect-utils");
var utils     = require("./utils");
var _         = require("lodash");

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
     * @param {BrowserSync} bs
     * @param data
     */
    "file:watching": function (bs, data) {
        if (Object.keys(data).length) {
            logger.info("Watching files...");
        }
    },
    /**
     * Log when a file changes
     * @param {BrowserSync} bs
     * @param data
     */
    "file:reload": function (bs, data) {
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
     * @param {BrowserSync} bs
     * @param data
     */
    "config:warn": function (bs, data) {
        logger.setOnce("useLevelPrefixes", true).warn(data.msg);
    },
    /**
     * @param {BrowserSync} bs
     * @param data
     */
    "stream:changed": function (bs, data) {

        var changed = data.changed;

        logger.info("{cyan:%s %s changed} ({magenta:%s})",
            changed.length,
            changed.length > 1 ? "files" : "file",
            changed.join(", ")
        );
    },
    /**
     * Client connected logging
     * @param {BrowserSync} bs
     * @param data
     */
    "client:connected": function (bs, data) {

        var uaString = utils.getUaString(data.ua);
        var msg = "{cyan:Browser Connected: {magenta:%s, version: %s}";
        var method = "info";

        if (!bs.options.get("logConnections")) {
            method = "debug";
        }

        logger.log(method, msg,
            uaString.name,
            uaString.version
        );
    },
    /**
     * Main logging when the service is running
     * @param {BrowserSync} bs
     * @param data
     */
    "service:running": function (bs, data) {

        var type    = data.type;

        if (type === "server") {

            var baseDir = bs.options.getIn(["server", "baseDir"]);

            logUrls(bs.options.get("urls"));

            if (baseDir) {
                if (utils.isList(baseDir)) {
                    baseDir.forEach(serveFiles);
                } else {
                    serveFiles(baseDir);
                }
            }
        }

        if (type === "proxy") {

            logger.info("Proxying: {cyan:%s}", bs.options.getIn(["proxy", "target"]));
            logger.info("Now you can access your site through the following addresses:");
            logUrls(bs.options.get("urls"));
        }

        if (type === "snippet" && bs.options.get("logSnippet")) {

            logger.info(
                "Copy the following snippet into your website, " +
                "just before the closing {cyan:</body>} tag"
            );

            logger.unprefixed("info",
                messages.scriptTags(bs.options)
            );
        }

        function serveFiles (base) {
            logger.info("Serving files from: {magenta:%s}", base);
        }

        function logUrls (urls) {

            urls.map(function (value, key) {
                logger.info("%s URL: {magenta:%s}",
                    utils.ucfirst(key),
                    value);
            });
        }
    }
};

module.exports.plugin = function (emitter, bs) {

    var logPrefix = bs.options.get("logPrefix");
    var logLevel  = bs.options.get("logLevel");

    // Should set logger level here!
    logger.setLevel(logLevel);

    if (logPrefix) {
        if (_.isFunction(logPrefix)) {
            logger.setPrefix(logPrefix);
        } else {
            logger.setPrefix(template.replace("%s", logPrefix));
        }
    }

    _.each(exports.callbacks, function (func, event) {
        emitter.on(event, func.bind(this, bs));
    });

    return logger;
};
