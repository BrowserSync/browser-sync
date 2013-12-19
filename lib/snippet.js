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
    excludeList: ['.js', '.css', '.svg', '.ico', '.woff', '.png', '.jpg', '.jpeg', '.gif'],
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
     * Check if there are script tags inside the HTML body
     * @param {String} body
     * @returns {boolean}
     */
    scriptInBody: function (body) {
        var bodyStart = body.indexOf('<body');
        if (!(body && body.lastIndexOf('<script') > bodyStart)) {
            return -1;
        }

        return body.indexOf('<script', bodyStart);
    },
    /**
     * Inserts a string into another string before a given index
     * @param {String} body
     * @param {Integer} index
     * @param {String} prepend
     * @returns {String}
     */
     insertBefore: function (body, index, prepend) {
       return body.substr(0, index) + prepend + body.substr(index);
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
    }
};
module.exports.utils = utils;

/**
 * Write function for injecting script tags
 * @param {Object} res
 * @param {String} tags
 * @param {Boolean} rewriteHeaders
 * @returns {Function}
 */
module.exports.write = function (res, tags, rewriteHeaders) {

    var write = res.write;

    return function (string, encoding) {
        var body = string instanceof Buffer ? string.toString() : string;
        var scriptInBody;

        if (utils.bodyExists(body)) {
            scriptInBody = utils.scriptInBody(body);
            if (~scriptInBody) {
                body = utils.insertBefore(body, scriptInBody, tags);
            } else {
                body = body.replace(/<\/body>/, function (w) {
                    return tags + w;
                });
            }
        }

        if (string instanceof Buffer) {
            string = new Buffer(body);
        } else {
            string = body;
        }

        if (rewriteHeaders) {
            // Remove content-length to allow snippets to inserted to any body length
            if (!this.headerSent) {
                if (this._headers.hasOwnProperty('content-length')) {
                    delete this._headers['content-length'];
                }
                this._implicitHeader();
            }
        }

        write.call(res, string, encoding);
    };
};