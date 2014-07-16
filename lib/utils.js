"use strict";


var devIp       = require("dev-ip");
var open        = require("opn");
var filePath    = require("path");
var portScanner = require("portscanner-plus");
var _           = require("lodash");
var UAParser    = require("ua-parser-js");

var parser      = new UAParser();

var utils = {
    /**
     * @param {Object} options
     * @returns {String|boolean} - the IP address
     */
    getHostIp: function (options) {

        var returnValue = devIp.getIp(null);

        if (options) {
            if (options.host && options.host !== "localhost") {
                return options.host;
            }
            if (options.detect === false || !devIp) {
                return false;
            }
        }

        if (Array.isArray(returnValue)) {
            returnValue = returnValue[0];
        }

        return returnValue || false;
    },
    /**
     * Take the path provided in options & transform into CWD for serving files
     * @param {String} [baseDir]
     * @returns {String}
     */
    getBaseDir: function (baseDir) {

        if (Array.isArray(baseDir)) {
            return baseDir;
        }

        var suffix = "";
        var validRoots = ["./", "/", "."];

        if (!baseDir || _.contains(validRoots, baseDir)) {
            return process.cwd();
        }

        if (baseDir.charAt(0) === "/") {
            suffix = baseDir;
        } else {
            if (/^.\//.test(baseDir)) {
                suffix = baseDir.replace(".", "");
            } else {
                suffix = "/" + baseDir;
            }
        }

        return process.cwd() + suffix;
    },
    /**
     * Set URL Options
     */
    setUrlOptions: function (port, opts) {

        var urls = {};
        var scheme = (opts.https !== undefined && !opts.proxy && !opts.tunnel) ? "https" : "http";

        if (!opts.online) {
            urls.local = scheme + "://localhost:" + port;
            return urls;
        }

        var external  = utils.xip(utils.getHostIp(opts), opts);

        var localhost = "localhost";

        if (opts.xip) {
            localhost = "127.0.0.1";
        }

        var local = utils.xip(localhost, opts);

        opts.external = opts.host = external;

        return utils.getUrls(external, local, scheme, port, opts);
    },
    /**
     * Append a start path if given in options
     * @param {String} url
     * @param {Object} options
     * @returns {String}
     */
    getUrl: function (url, options) {

        var prefix = "/";
        var startPath = options.startPath;

        if (options.proxy && options.proxy.startPath) {
            startPath = options.proxy.startPath;
        }

        if (startPath) {
            if (startPath.charAt(0) === "/") {
                prefix = "";
            }
            url = url + prefix + startPath;
        }

        return url;
    },
    /**
     * @param {String} external
     * @param {number|string} port
     * @param {String} scheme
     * @param {Object} options
     * @param {String} local
     * @returns {{local: string, external: string}}
     */
    getUrls: function (external, local, scheme, port, options) {

        var urls = {
            local: utils.getUrl(utils._makeUrl(scheme, local, port), options)
        };

        if (external !== local) {
            urls.external = utils.getUrl(utils._makeUrl(scheme, external, port), options);
        }

        return urls;
    },
    /**
     * @param {String} scheme
     * @param {String} host
     * @param {Number} port
     * @returns {String}
     * @private
     */
    _makeUrl: function (scheme, host, port) {
        return scheme + "://" + host + ":" + port;
    },
    /**
     * Get ports
     * @param {Object} options
     * @returns {Q.promise}
     */
    getPorts: function (options) {

        var port  = options.port;
        var ports = options.ports; // backwards compatibility
        var max;

        if (ports) {
            port = ports.min;
            max  = ports.max;
        }

        return portScanner.getPorts(1, port, max);
    },
    /**
     * @param {String} ua
     * @returns {Object}
     */
    getUaString: function (ua) {
        return parser.setUA(ua).getBrowser();
    },
    /**
     * @param {String} filepath
     * @param {String} cwd
     * @returns {String}
     */
    resolveRelativeFilePath: function (filepath, cwd) {
        return filepath.replace(cwd + "/", "");
    },
    /**
     * @param {String} path
     * @returns {String}
     */
    getFileExtension: function (path) {
        return filePath.extname(path).replace(".", "");
    },
    /**
     * Open the page in browser
     * @param {String} url
     * @param {Object} options
     */
    openBrowser: function (url, options) {

        if (typeof options.open === "string") {
            if (options.urls[options.open]) {
                url = options.urls[options.open];
            }
        }

        if (options.open) {

            if (options.browser !== "default") {
                if (Array.isArray(options.browser)) {
                    options.browser.forEach(function (browser) {
                        utils.open(url, browser);
                    });
                } else {
                    utils.open(url, options.browser); // single
                }
            } else {
                utils.open(url);
            }
        }
    },
    /**
     * Wrapper for open module - for easier stubbin'
     * @param url
     * @param name
     */
    open: function (url, name) {
        open(url, name || null);
    },
    /**
     * Log a message to the console
     * @param {String} level
     * @param {String} msg
     * @param {Object} options
     * @returns {boolean}
     */
    log: function (level, msg, options) {

        var msgs = require("./messages");

        /** Backwards compat **/
        if (options && (options.logLevel === "silent" || options.debugInfo === false)) {
            return false;
        }

        if (options.logLevel === "debug") {
            if (level === "debug") {
                console.log(msgs.getDebug(msg));
            } else {
                console.log(msg);
            }
        } else {
            if (level === "info") {
                return console.log(msg);
            }
        }
    },
    /**
     * @param {Object} options
     * @returns {Function}
     */
    getDebugger: function (options) {
        return function (msg, vars) {
            utils.log("debug", msg.replace("%s", vars), options);
        };
    },
    /**
     * @param {Object} options
     * @returns {Function}
     */
    getInfoLogger: function (options) {
        return function (msg, vars, prefix) {
            var msgs = require("./messages");
            if (prefix) {
                msg = msgs.getPrefix() + msg;
            }
            utils.log("info", msgs.compile(msg.replace("%s", vars)), options);
        };
    },
    /**
     * @param {String} msg
     * @param {*} vars
     * @param {Object} options
     */
    debug: function (msg, vars, options) {
        utils.log("debug", msg.replace("%s", vars), options);
    },
    /**
     * @param {String} msg
     * @param {*} vars
     * @param {Object} options
     */
    warn: function (msg, vars, options) {
        utils.log("warn", msg.replace("%s", vars), options);
    },
    /**
     * @param {String} msg
     * @param {Object} options
     * @param {Boolean} kill
     */
    fail: function (msg, options, kill) {
        utils.log("info", msg, options);
        if (kill) {
            process.exit(1);
        }
    },
    /**
     * Add support for xip.io urls
     * @param {String} host
     * @param {Object} options
     * @returns {String}
     */
    xip: function (host, options) {
        if (options.xip) {
            return host + ".xip.io";
        }
        if (options.hostnameSuffix) {
            return host + options.hostnameSuffix;
        }
        return host;
    },
    ucfirst: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
};

module.exports.utils = utils;