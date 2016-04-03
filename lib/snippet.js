"use strict";

var connectUtils = require("./connect-utils");
var config       = require("./config");

var lrSnippet    = require("resp-modifier");
var path         = require("path");
var List         = require("immutable").List;
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

        return {
            match: options.getIn(["rule", "match"]),
            fn: function (req, res, match) {
                return fn.apply(null, [snippet, match]);
            },
            once: true,
            id: "bs-snippet"
        };
    },
    getSnippetMiddleware: function (snippet, options, rewriteRules) {
        return lrSnippet.create(utils.getRules(snippet, options, rewriteRules));
    },
    getRules: function (snippet, options, rewriteRules) {

        var rules = [utils.getRegex(snippet, options)];

        if (rewriteRules) {
            rules = rules.concat(rewriteRules);
        }

        return {
            rules: rules,
            blacklist: utils.arrify(options.get("blacklist")),
            whitelist: utils.arrify(options.get("whitelist"))
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
     * @param {Number} port
     * @param {BrowserSync.options} options
     * @returns {String}
     */
    getClientJs: function (port, options) {
        var socket = utils.getSocketScript();
        var noConflictJs = "window.___browserSync___oldSocketIo = window.io;";
        return noConflictJs + socket + ";" + connectUtils.socketConnector(options);
    },
    /**
     * @returns {String}
     */
    getSocketScript: function () {
        return fs.readFileSync(path.join(__dirname, config.socketIoScript), "utf-8");
    },
    /**
     * @param {Immutable.List|Array|String} incoming
     * @returns {Array}
     */
    arrify: function (incoming) {
        if (List.isList(incoming)) {
            return incoming.toArray();
        }
        return [].concat(incoming).filter(Boolean);
    }
};
module.exports.utils = utils;
