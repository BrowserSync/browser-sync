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
            match: new RegExp(string, "g"),
            fn: function () {
                return proxyUrl;
            }
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
    var rewriteLinks = utils.rewriteLinks(proxyOptions, proxyUrl);
    var scriptTags = messages.scriptTags(host, ports, options);
    var proxy = httpProxy.createProxyServer({});
    var snippetMw = snippetUtils.getSnippetMiddleware(scriptTags, rewriteLinks);

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

        reqCallback(req, res);
        snippetMw(req, res, next);
    });

    server.listen(ports.proxy);

    return server;
};
