"use strict";

var devIp       = require("dev-ip");
var open        = require("opn");
var filePath    = require("path");
var portScanner = require("portscanner");
var _           = require("lodash");
var Immutable   = require("immutable");
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
            var host = options.get("host");
            if (host && host !== "localhost") {
                return host;
            }
            if (options.get("detect") === false || !devIp) {
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
    getScheme: function (options) {
        return (options.get("https") && !options.get("proxy") && !options.get("tunnel")) ? "https" : "http"
    },
    /**
     * Set URL Options
     */
    setUrlOptions: function (options) {

        var scheme = options.get("scheme");
        var port   = options.get("port");
        var urls   = {};

        if (options.get("online") === false) {
            urls.local = utils.getUrl(scheme + "://localhost:" + port, options);
            return Immutable.fromJS(urls);
        }

        var external  = utils.xip(utils.getHostIp(options), options);
        var localhost = "localhost";

        if (options.get("xip")) {
            localhost = "127.0.0.1";
        }

        localhost = utils.xip(localhost, options);

        return Immutable.fromJS(utils.getUrls(external, localhost, scheme, options));
    },
    /**
     * Append a start path if given in options
     * @param {String} url
     * @param {Object} options
     * @returns {String}
     */
    getUrl: function (url, options) {

        var prefix = "/";
        var startPath = options.get("startPath");

        if (options.get("proxy") && options.getIn(["proxy", "startPath"])) {
            startPath = options.getIn(["proxy", "path"]);
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
     * @param {String} local
     * @param {String} scheme
     * @param {number|string} port
     * @param {Object} options
     * @returns {{local: string, external: string}}
     */
    getUrls: function (external, local, scheme, options) {

        var urls = {
            local: utils.getUrl(utils._makeUrl(scheme, local, options.get("port")), options)
        };

        if (external !== local) {
            urls.external = utils.getUrl(utils._makeUrl(scheme, external, options.get("port")), options);
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
     * @param {Function} cb
     */
    getPorts: function (options, cb) {

        var port  = options.get("port");
        var ports = options.get("ports"); // backwards compatibility
        var max;

        if (ports) {
            port = ports.get("min");
            max  = ports.get("max") || null;
        }

        portScanner.findAPortNotInUse(port, max, {
            host: "localhost",
            timeout: 1000
        }, cb);
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

        if (_.isString(options.open)) {
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
     * @param {Boolean} kill
     * @param err
     * @param cb
     */
    fail: function (kill, err, cb) {
        if (kill) {
            if (cb && _.isFunction(cb)) {
                cb(new Error(err));
            }
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
        var suffix = options.get("hostnameSuffix");
        if (options.get("xip")) {
            return host + ".xip.io";
        }
        if (suffix) {
            return host + suffix;
        }
        return host;
    },
    /**
     * @param {String} string
     * @returns {string}
     */
    ucfirst: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
     * Determine if an array of file paths will cause a full page reload.
     * @param {Array} needles - filepath such as ["core.css", "index.html"]
     * @param {Array} haystack
     * @returns {Boolean}
     */
    willCauseReload: function (needles, haystack) {
        return needles.some(function (needle) {
            return !_.contains(haystack, filePath.extname(needle).replace(".", ""));
        });
    },
    /**
     * @param value
     */
    makeList: function (value) {

        if (_.isString(value)) {
            return Immutable.List([value]);
        }

        return Immutable.List(value);
    }
};

module.exports = utils;
