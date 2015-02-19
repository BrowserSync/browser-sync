"use strict";

var _             = require("lodash");
var open          = require("opn");
var devIp         = require("dev-ip")();
var Immutable     = require("immutable");
var portScanner   = require("portscanner");
var filePath      = require("path");
var UAParser      = require("ua-parser-js");
var parser        = new UAParser();

var utils = {
    /**
     * @param {Object} options
     * @returns {String|boolean} - the IP address
     * @param devIp
     */
    getHostIp: function (options, devIp) {

        if (options) {
            var host = options.get("host");
            if (host && host !== "localhost") {
                return host;
            }
            if (options.get("detect") === false || !devIp.length) {
                return false;
            }
        }

        return devIp.length ? devIp[0] : false;
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
     * @param options
     * @returns {string}
     */
    getScheme: function (options) {
        return (options.get("https") && !options.get("proxy") && !options.get("tunnel")) ? "https" : "http";
    },
    /**
     * Set URL Options
     */
    getUrlOptions: function (options) {

        var scheme = options.get("scheme");

        var port   = options.get("port");
        var urls   = {};

        if (options.get("online") === false) {
            urls.local = utils.getUrl(scheme + "://localhost:" + port, options);
            return Immutable.fromJS(urls);
        }

        var external  = utils.xip(utils.getHostIp(options, devIp), options);
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
            startPath = options.getIn(["proxy", "url", "path"]);
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

        var open    = options.get("open");
        var browser = options.get("browser");

        if (_.isString(open)) {
            if (options.getIn(["urls", open])) {
                url = options.getIn(["urls", open]);
            }
        }

        if (open) {
            if (browser !== "default") {
                if (utils.isList(browser)) {
                    browser.forEach(function (browser) {
                        utils.open(url, browser);
                    });
                } else {
                    utils.open(url, browser); // single
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
     * @param {String} errMessage
     * @param {Function} [cb]
     */
    fail: function (kill, errMessage, cb) {
        if (kill) {
            if (cb && _.isFunction(cb)) {
                cb(new Error(errMessage));
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
    },
    isList: Immutable.List.isList,
    isMap: Immutable.List.isMap,
    /**
     * @param {Map} options
     * @returns {Array}
     */
    getConfigErrors: function (options) {

        var messages = require("./config").errors;

        var errors = [];

        if (options.get("server") && options.get("proxy")) {
            errors.push(messages["server+proxy"]);
        }

        if (options.get("https") && options.get("proxy")) {
            if (options.getIn(["proxy", "url", "protocol"]) !== "https:") {
                errors.push([messages["proxy+https"], options.getIn(["proxy", "target"])].join(" "));
            }
        }

        return errors;
    },
    /**
     * @param {Map} options
     * @param {Function} [cb]
     */
    verifyConfig: function (options, cb) {
        var errors = utils.getConfigErrors(options);
        if (errors.length) {
            utils.fail(true, errors.join("\n"), cb);
            return false;
        }
        return true;
    },
    /**
     * @returns {Transform}
     */
    noopStream: function () {
        var Transform = require("stream").Transform;
        var reload    = new Transform({objectMode:true});
        reload._transform = function (file, enc, cb) {
            this.push(file); // always send the file down-stream
            cb();
        };
        return reload;
    },
    /**
     * @param err
     */
    defaultCallback: function (err) {
        if (err && err.message) {
            console.error(err.message);
        }
    }
};

module.exports              = utils;
module.exports.portscanner  = portScanner;
module.exports.UAParser     = UAParser;
module.exports.connect      = require("connect");
module.exports.devIp        = devIp;
module.exports.serveStatic  = require("serve-static");
module.exports.easyExtender = require("easy-extender");
