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
     * @returns {Function}
     */
    appendSnippet: function (snippet) {
        return function (w) {
            return w + snippet;
        };
    },
    /**
     * @param {String} snippet
     * @returns {{match: RegExp, fn: Function}}
     */
    getRegex: function (snippet) {
        return {
            match: /<body[^>]*>/i,
            fn: utils.appendSnippet(snippet)
        };
    },
    /**
     * @param {String} snippet
     * @param {Object} [extraRules]
     * @returns {Function}
     */
    getSnippetMiddleware: function (snippet, extraRules) {

        var rules = [utils.getRegex(snippet)];

        if (extraRules) {
            rules.push(extraRules);
        }

        return lrSnippet({rules: rules});
    },
    /**
     * @param {String} scripts - the clientside JS
     * @param {String} scriptPath - the URL to match
     * @returns {Function}
     */
    getProxyMiddleware: function (scripts, scriptPath) {
        return function (req, res, next) {
            if (req.url.indexOf(scriptPath) > -1) {
                res.writeHead(200, { "Content-Type": "text/javascript" });
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
    /**
     * @param {number} port
     * @param {BrowserSync.options} options
     * @returns {String}
     */
    getClientJs: function (port, options) {

        var js = options.socketJs = fs.readFileSync(path.resolve(__dirname + config.socketIoScript), "utf-8") + ";";

        return js += messages.socketConnector(port, options);
    }
};
module.exports.utils = utils;
