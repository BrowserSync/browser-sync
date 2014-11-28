"use strict";

var messages  = require("./messages");
var config    = require("./config");

var lrSnippet = require("resp-modifier");
var path      = require("path");
var _         = require("lodash");
var fs        = require("fs");

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

        var fn    = options.rule.fn.bind(null, snippet);

        return {
            match: options.rule.match,
            fn: fn
        };
    },
    /**
     * @param {String} snippet
     * @param {Object} [options]
     * @returns {Function}
     */
    getSnippetMiddleware: function (snippet, options) {

        options = options || {};

        return lrSnippet({
            rules: [utils.getRegex(snippet, options)],
            ignorePaths: options.ignorePaths
        });
    },
    /**
     * @param {String} scripts - the client side JS
     * @param {String} scriptPath - the URL to match
     * @returns {Function}
     */
    getProxyMiddleware: function (scripts, scriptPath) {
        return function (req, res, next) {
            if (req.url.indexOf(scriptPath) > -1) {
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.write(scripts);
                res.end();
                return next(true);
            } else {
                return next(false);
            }
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
        return utils.getNoConflictJs() + socket + ";" + messages.socketConnector(port, options);
    },
    /**
     * @returns {String}
     */
    getSocketScript: function () {
        return fs.readFileSync(path.resolve(__dirname + config.socketIoScript), "utf-8");
    }
};
module.exports.utils = utils;
