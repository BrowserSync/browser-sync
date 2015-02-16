"use strict";

var connectUtils = require("./connect-utils");
var config       = require("./config");

var lrSnippet    = require("resp-modifier");
var path         = require("path");
var _            = require("lodash");
var fs           = require("fs");

/**
 * Utils for snippet injection
 */
var utils = {
    /**
     * @param {String} url
     * @param {Array} excludeList
     * @returns {boolean}
     */
    isExcluded: function (url, excludeList) {

        var extension = path.extname(url);

        if (extension) {

            if (~url.indexOf("?")) {
                return true;
            }
            extension = extension.slice(1);
            return _.contains(excludeList, extension);
        }
        return false;
    },
    /**
     * @param {String} snippet
     * @param {Object} options
     * @returns {{match: RegExp, fn: Function}}
     */
    getRegex: function (snippet, options) {

        var fn = options.getIn(["rule", "fn"]);
        fn     = fn.bind(null, snippet);

        return {
            match: options.getIn(["rule", "match"]),
            fn: fn
        };
    },
    /**
     * @param {String} snippet
     * @param {Object} [options]
     * @returns {Function}
     */
    getSnippetMiddleware: function (snippet, options) {
        return lrSnippet({
            rules: [utils.getRegex(snippet, options)],
            blacklist: options.get("blacklist").toJS(),
            whitelist: options.get("whitelist").toJS()
        });
    },
    /**
     * @param {String} scripts - the client side JS
     * @param {String} scriptPath - the URL to match
     * @returns {Function}
     */
    getProxyMiddleware: function (scripts, scriptPath) {
        return function serveBsJavascriptfile (req, res, next) {
            if (req.url.indexOf(scriptPath) > -1) {
                res.writeHead(200, {"Content-Type": "text/javascript"});
                return res.end(scripts);
            }
            next();
        };
    },
    /**
     * @param {Object} req
     * @param {Array} [excludeList]
     * @returns {Object}
     */
    isOldIe: function (req, excludeList) {
        var ua = req.headers["user-agent"];
        var match = /MSIE (\d)\.\d/.exec(ua);
        if (match) {
            if (parseInt(match[1], 10) < 9) {
                if (!utils.isExcluded(req.url, excludeList)) {
                    req.headers["accept"] = "text/html";
                }
            }
        }
        return req;
    },
    getNoConflictJs: function () {
        return "window.___browserSync___oldSocketIo = window.io;";
    },
    /**
     * @param {Number} port
     * @param {BrowserSync.options} options
     * @returns {String}
     */
    getClientJs: function (port, options) {

        var socket = utils.getSocketScript();
        return utils.getNoConflictJs() + socket + ";" + connectUtils.socketConnector(options);
    },
    /**
     * @returns {String}
     */
    getSocketScript: function () {
        return fs.readFileSync(path.join(__dirname, config.socketIoScript), "utf-8");
    }
};
module.exports.utils = utils;
