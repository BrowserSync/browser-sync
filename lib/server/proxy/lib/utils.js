"use strict";

var url  = require("url");
var path = require("path");

var excludeList = [
    ".js",
    ".css",
    ".pdf",
    ".map",
    ".svg",
    ".ico",
    ".woff",
    ".json",
    ".eot",
    ".ttf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".mp4",
    ".mp3",
    ".3gp",
    ".ogg",
    ".ogv",
    ".webm",
    ".m4a",
    ".flv",
    ".wmv",
    ".avi",
    ".swf",
    ".scss"
];

/**
 * Remove Headers from a response
 * @param {Object} headers
 * @param {Array} items
 */
function removeHeaders(headers, items) {
    items.forEach(function (item) {
        if (headers.hasOwnProperty(item)) {
            delete headers[item];
        }
    });
}

/**
 * Get the proxy host with optional port
 */
function getProxyHost(opts) {
    if (opts.port && opts.port !== 80) {
        return opts.host + ":" + opts.port;
    }
    return opts.host;
}

/**
 * Handle redirect urls
 * @param {String} url
 * @param {Object} opts
 * @param {Object} proxyHost
 * @returns {String}
 */
function handleRedirect(url, opts, proxyHost) {

    var fullHost  = opts.host + ":" + opts.port;

    if (~url.indexOf(fullHost)) {
        return url.replace(fullHost, proxyHost);
    } else {
        return url.replace(opts.host, proxyHost);
    }
}

function getProxyUrl(opts) {
    return opts.protocol + "://" + getProxyHost(opts);
}

/**
 * @param userServer
 * @param proxyUrl
 * @returns {{match: RegExp, fn: Function}}
 */
function rewriteLinks(userServer, proxyUrl) {

    var string = "";
    var host = userServer.host;
    var port = userServer.port;

    if (host && port) {
        string = host;
        if (parseInt(port, 10) !== 80) {
            string = host + ":" + port;
        }
    } else {
        string = host;
    }

    return {
        match: new RegExp("['\"]([htps:/]+)?" + string + ".*?(?='|\")", "g"),
        fn: function (match) {
            return match.replace(new RegExp(string), proxyUrl);
        }
    };
}

/**
 * @param {Object} req
 * @param {Array} [excludeList]
 * @returns {Object}
 */
function handleIe(req) {
    var ua = req.headers["user-agent"];
    var match = /MSIE (\d)\.\d/.exec(ua);
    if (match) {

        if (parseInt(match[1], 10) < 9) {

            var parsed   = url.parse(req.url);
            var ext      = path.extname(parsed.pathname);
            var excluded = excludeList.some(function (item) {
                return item === ext;
            });

            if (!excluded) {
                req.headers["accept"] = "text/html";
            }
        }
    }
    return req;
}

module.exports = {
    rewriteLinks: rewriteLinks,
    handleRedirect: handleRedirect,
    getProxyHost: getProxyHost,
    getProxyUrl: getProxyUrl,
    removeHeaders: removeHeaders,
    handleIe: handleIe
};
