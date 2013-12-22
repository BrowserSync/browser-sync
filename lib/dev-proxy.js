"use strict";

var httpProxy = require("http-proxy");
var messages = require("./messages");
var write = require("./snippet").write;
var utils = require("./snippet").utils;

/**
 * @param {String} host
 * @param {Array} ports
 * @param {Object} options
 */
module.exports = function (host, ports, options) {

    var proxyOptions = options.proxy;

    //
    // Set up a proxy
    //
    var server = httpProxy.createServer(function (req, res, proxy) {

        //
        // Put your custom server logic here
        //
        var next = function () {
            proxy.proxyRequest(req, res, {
                host: proxyOptions.host,
                port: proxyOptions.port || 80,
                changeOrigin: true
            });
        };

        if (utils.isExcluded(req)) {
            return next();
        }

        var tags = messages.scriptTags(host, ports[0], ports[1]);

        res.write = write(res, tags);

        next();

    }).listen(ports[2]);

    //
    // Remove content-length to allow snippets to inserted to any body length
    //
    server.proxy.on("proxyResponse", function (req, res, response) {
        if (response.headers.hasOwnProperty("content-length")) {
            delete response.headers["content-length"];
        }
    });

    return server;

};