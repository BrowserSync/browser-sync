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
     * @returns {String} - the IP address
     */
    getHostIp: function (options) {

        var fallback = "0.0.0.0";
        var returnValue = devIp.getIp(null);

        if (options) {
            if (options.host) {
                return options.host;
            }
            if (options.detect === false || !devIp) {
                return fallback;
            }
        }

        if (Array.isArray(returnValue)) {
            returnValue = returnValue[0];
        }

        return returnValue || fallback;
    },
    /**
     * Take the path provided in options & transform into CWD for serving files
     * @param {string} [baseDir]
     * @returns {string}
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
    setUrlOptions: function (ports, opts) {

        var port      = ports.server || ports.proxy;
        var external  = utils.xip(utils.getHostIp(opts), opts);
        var localhost = "localhost";

        if (opts.xip) {
            localhost = "127.0.0.1";
        }

        var local = utils.xip(localhost, opts);

        opts.external = opts.host = external;

        if (port) {
            opts.urls = utils.getUrls(external, local, port, opts);
        }
    },
    /**
     * Append a start path if given in options
     * @param {string} url
     * @param {object} options
     * @returns {string}
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
     * @param {string} external
     * @param {number|string} port
     * @param {object} options
     * @param {string} local
     * @returns {{local: string, remote: string}}
     */
    getUrls: function (external, local, port, options) {
        return {
            local: utils.getUrl(utils._makeUrl(local, port), options),
            remote: utils.getUrl(utils._makeUrl(external, port), options)
        };
    },
    /**
     * @param {String} host
     * @param {Number} port
     * @returns {string}
     * @private
     */
    _makeUrl: function (host, port) {
        return "http://" + host + ":" + port;
    },
    /**
     * Get ports
     * @param {object} options
     * @param {number} minCount
     * @returns {Q.promise}
     */
    getPorts: function (options, minCount) {

        var minPorts = (options.server || options.proxy) ? 3 : minCount;
        var minPortRange = options.ports && options.ports.min;
        var maxPortRange = options.ports && options.ports.max;

        var names = ["socket", "controlPanel"];

        if (options.server) {
            names.push("server");
        }

        if (options.proxy) {
            names.push("proxy");
        }

        return portScanner.getPorts(minPorts, minPortRange, maxPortRange, names);
    },
    /**
     * @param {String} ua
     * @returns {Object}
     */
    getUaString: function (ua) {
        return parser.setUA(ua).getBrowser();
    },
    /**
     * @param {string} filepath
     * @param {string} cwd
     * @returns {string}
     */
    resolveRelativeFilePath: function (filepath, cwd) {
        return filepath.replace(cwd + "/", "");
    },
    /**
     * @param {string} path
     * @returns {string}
     */
    getFileExtension: function (path) {
        return filePath.extname(path).replace(".", "");
    },
    /**
     * Open the page in browser
     * @param {string} url
     * @param {object} options
     */
    openBrowser: function (url, options) {

        function opnBrowser (name) {
            open(url, name);
        }

        if (options.open) {

            if (options.browser !== "default") {
                if (Array.isArray(options.browser)) {
                    options.browser.forEach(opnBrowser);
                } else {
                    opnBrowser(options.browser); // single
                }
            } else {
                open(url);
            }
        }
    },
    /**
     * Log a message to the console
     * @param {string} msg
     * @param {object} options
     * @param {boolean} override
     * @returns {boolean}
     */
    log: function (msg, options, override) {
        if (!options.debugInfo && !override) {
            return false;
        }
        return console.log(msg);
    },
    /**
     * @param {String} msg
     * @param {Object} options
     * @param {Boolean} kill
     */
    fail: function (msg, options, kill) {
        this.log(msg, options, false);
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
    }
};

module.exports.utils = utils;