"use strict";

// var cheerio = require("cheerio");

/**
 *
 * Utils for snippet injection
 *
 * @type {{excludeList: string[], bodyExists: bodyExists, isExcluded: isExcluded}}
 *
 */
var utils = {
    /**
     * requests to ignore
     */
    excludeList: [".js", ".css", ".svg", ".ico", ".woff", ".eot", ".ttf", ".png", ".jpg", ".jpeg", ".gif"],
    /**
     * Check if HTML body exists
     * @param {String} body
     * @returns {*}
     */
    bodyExists: function (body) {
        if (!body) {
            return false;
        }
        return (~body.lastIndexOf("</body>"));
    },
    /**
     *
     * @param req
     * @returns {boolean}
     */
    isExcluded: function (req) {
        var url = req.url;
        var excluded = false;
        if (!url) {
            return true;
        }
        this.excludeList.forEach(function(exclude) {
            if (~url.indexOf(exclude)) {
                excluded = true;
            }
        });
        return excluded;
    },
    /**
     * Prepends the script tags
     * @param {String} body
     * @param {String} tags
     * @return {String}
     */
    prependScripts: function (body, tags) {
        var index = -1;
        var lines = body.split("\n");

        /* jshint -W016 */ // "Unexpected use of '++'"
        for (var i = 0, l = lines.length; i < l; i++) {
            if (lines[i].match(/<script/)) {
                index = i;
                break;
            }
        }

        lines.splice(index - 1, 0, tags);
        return lines.join("\n");
    }
};
module.exports.utils = utils;

/**
 * Write function for injecting script tags
 * @param {Object} res
 * @param {String} tags
 * @param {Boolean} rewriteHeaders
 * @param {Function} callback - any more actions on the parsed body
 * @returns {Function}
 */
module.exports.write = function (res, tags, rewriteHeaders, callback) {

    var write = res.write;

    return function (string, encoding) {

        var body = string instanceof Buffer ? string.toString() : string;

        if (utils.bodyExists(body)) {
            if (body.indexOf("<script")) {
                body = utils.prependScripts(body, tags);
            } else {
                body = body.replace(/<\/body>/, function (w) {
                    return tags + w;
                });
            }
        }

        if (typeof callback === "function") {
            body = callback(body);
        }

        if (string instanceof Buffer) {
            string = new Buffer(body);
        } else {
            string = body;
        }

        if (rewriteHeaders) {
            // Remove content-length to allow snippets to inserted to any body length
            if (!this.headerSent) {
                if (this._headers.hasOwnProperty("content-length")) {
                    delete this._headers["content-length"];
                }
                this._implicitHeader();
            }
        }

        write.call(res, string, encoding);
    };
};