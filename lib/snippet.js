"use strict";

var messages  = require("./messages");

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
     * @param {string} snippet
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
     * @param {string} scripts - the clientside JS
     * @param {string} scriptPath - the URL to match
     * @returns {Function}
     */
    getProxyMiddleware: function (scripts, scriptPath) {
        return function (req, res, next) {
            if (req.url.indexOf(scriptPath) > -1) {
                res.setHeader("Content-Type", "text/javascript");
                res.end(scripts);
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
     * @returns {string}
     */
    getClientJs: function (port, options) {
        var js;
        var path1 = "/../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.min.js";
        var path2 = "/../node_modules/socket.io-client/dist/socket.io.min.js";
        try {
            js = fs.readFileSync(path.resolve(__dirname + path1), "utf-8") + ";";
        } catch (e) {
            try {
                js = fs.readFileSync(path.resolve(__dirname + path2), "utf-8") + ";";
            } catch (e) {

            }
        }

        js = js.replace(",typeof define==\"function\"&&define.amd&&define([],function(){return io})", "");

        return js += messages.socketConnector(port, options);
    }
};
module.exports.utils = utils;
