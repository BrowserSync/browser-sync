"use strict";

var httpProxy = require("http-proxy");
var messages = require("./messages");
var write = require("./snippet").write;
var snippetUtils = require("./snippet").utils;

var utils = {
    /**
     * @param userServer
     * @param proxyUrl
     * @returns {*|XML|string|void}
     */
    rewriteLinks: function (userServer, proxyUrl) {

        /**
         * @param {String} html
         */
        return function (html) {

            var string = "";
            var host = userServer.host;
            var port = userServer.port;
            var regex;

            if (host && port) {
                string = host + ":" + port;
            } else {
                string = host;
            }

            regex = new RegExp(string, "g");

            return html.replace(regex, function () {
                return proxyUrl;
            });
        };
    },
    /**
     * Remove Headers from a response
     * @param {Object} headers
     * @param {Array} items
     */
    removeHeaders: function (headers, items) {
        items.forEach(function (item) {
            if (headers.hasOwnProperty(item)) {
                delete headers[item];
            }
        });
    }
};
module.exports.utils = utils;

/**
 * @param {String} host
 * @param {Array} ports
 * @param {Object} options
 * @param {Function} reqCallback
 */
module.exports.createProxy = function (host, ports, options, reqCallback) {

    var proxyOptions = options.proxy;
    var proxyUrl = host + ":" + ports[2];

    //
    // Set up a proxy
    //
    var server = httpProxy.createServer(function (req, res, proxy) {

        var next = function () {
            proxy.proxyRequest(req, res, {
                host: proxyOptions.host,
                port: proxyOptions.port || 80,
                changeOrigin: true
            });
        };

        if (snippetUtils.isExcluded(req)) {
            return next();
        }

        // Alter accept-encoding header to ensure plain-text response
        req.headers["accept-encoding"] = "*;q=1,gzip=0";

        var tags = messages.scriptTags(host, ports[0], ports[1]);

        res.write = write(res, tags, null, utils.rewriteLinks(proxyOptions, proxyUrl));

        reqCallback(req, res, next);

    }).listen(ports[2]);

    //
    // Remove content-length to allow snippets to inserted to any body length
    //
    server.proxy.on("proxyResponse", function (req, res, response) {
        utils.removeHeaders(response.headers, ["content-length", "content-encoding"]);
    });

    return server;
};