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

            logUrls(bs.options.get("urls").toJS());

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
            logUrls(bs.options.get("urls").toJS());
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
    }
};

/**
 * Plugin interface for BrowserSync
 * @param {EventEmitter} emitter
 * @param {BrowserSync} bs
 * @returns {Object}
 */
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

/**
 *
 * @param urls
 */
function logUrls (urls) {

    var longestName = 0;
    var longesturl  = 0;
    var offset      = 2;

    var names = Object.keys(urls).map(function (key) {
        if (key.length > longestName) {
            longestName = key.length;
        }
        if (urls[key].length > longesturl) {
            longesturl = urls[key].length;
        }
        return key;
    });

    var underline  = getChars(longestName + offset + longesturl + 1, "-");
    var underlined = false;

    logger.info("{bold:Access URLs:");
    logger.unprefixed("info", "{grey: %s", underline);

    Object.keys(urls).forEach(function (key, i) {
        var keyname = getKeyName(key);
        logger.unprefixed("info", " %s: {magenta:%s}",
            getPadding(key.length, longestName + offset) + keyname,
            urls[key]
        );
        if (!underlined && names[i + 1] && names[i + 1].indexOf("ui") > -1) {
            underlined = true;
            logger.unprefixed("info", "{grey: %s}", underline);
        }
    });

    logger.unprefixed("info", "{grey: %s}", underline);
}

/**
 * @param {Number} len
 * @param {Number} max
 * @returns {string}
 */
function getPadding (len, max) {
    return new Array(max - (len + 1)).join(" ");
}

/**
 * @param {Number} len
 * @param {String} char
 * @returns {string}
 */
function getChars (len, char) {
    return new Array(len).join(char);
}

/**
 * Transform url-key names into something more presentable
 * @param key
 * @returns {string}
 */
function getKeyName(key) {
    if (key.indexOf("ui") > -1) {
        if (key === "ui") {
            return "UI";
        }
        if (key === "ui-external") {
            return "UI External";
        }
    }
    return utils.ucfirst(key);
}
