"use strict";

var path = require("path");
var _ = require("lodash");
var lrSnippet = require("resp-modifier");

/**
 *
 * Utils for snippet injection
 *
 * @type {{excludeList: string[], bodyExists: bodyExists, isExcluded: isExcluded}}
 *
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
    appendSnippet: function (snippet) {
        return function (w) {
            return w + snippet;
        };
    },
    getSnippetMiddleware: function (snippet, extraRules) {

        var rules = [{
            match: /<head[^>]*>/i,
            fn: this.appendSnippet(snippet)
        }];

        if (extraRules) {
            rules.push(extraRules);
        }

        return lrSnippet({rules:rules});
    },
    isOldIe: function (req) {
        var ua = req.headers["user-agent"];
        var match = /MSIE (\d)\.\d/.exec(ua);
        if (match) {
            if (parseInt(match[1], 10) < 9) {
                req.headers["accept"] = "text/html";
            }
        }
        return req;
    }
};
module.exports.utils = utils;
