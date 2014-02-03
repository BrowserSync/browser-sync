"use strict";

var path = require("path");
var _ = require("lodash");

/**
 *
 * Utils for snippet injection
 *
 * @type {{excludeList: string[], bodyExists: bodyExists, isExcluded: isExcluded}}
 *
 */
var utils = {
    bodyPattern: /<body[^>]*>/i,

    /**
     * Check if HTML body exists
     * @param {String} body
     * @returns {*}
     */
    bodyExists: function (body) {
        if (!body) {
            return false;
        }
        return (body.match(this.bodyPattern));
    },
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
            body = body.replace(utils.bodyPattern, function (w) {
                return w + tags;
            });
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
