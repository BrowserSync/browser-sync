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
 * @param {Object} ports
 * @param {Object} options
 * @param {Function} reqCallback
 */
module.exports.createProxy = function (host, ports, options, reqCallback) {

    var proxyOptions = options.proxy;
    var proxyUrl = host + ":" + ports.proxy;

    var proxy = httpProxy.createProxyServer({});

    var server = require("http").createServer(function(req, res) {

        req.headers["accept-encoding"] = "identity";

        var next = function () {
            proxy.web(req, res, {
                target: {
                    host: proxyOptions.host,
                    port: proxyOptions.port || 80
                },
                headers: {
                    host: proxyOptions.host
                }
            });
        };

        if (snippetUtils.isExcluded(req.url, options.excludedFileTypes)) {
            return next();
        }

        var tags = messages.scriptTags(host, ports, options);

        res.write = write(res, tags, null, utils.rewriteLinks(proxyOptions, proxyUrl));

        reqCallback(req, res, next);

    });

    server.listen(ports.proxy);

    //
    // Remove content-length to allow snippets to inserted to any body length
    //
    proxy.on("proxyRes", function (res) {
        utils.removeHeaders(res.headers, ["content-length", "content-encoding"]);
    });

    return server;
};
