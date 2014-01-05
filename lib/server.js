"use strict";

//var messages = require("./messages");
var connect = require("connect");
var http = require("http");
var loadSnippet = require("./loadSnippet");
//var controlPanel = require("./control-panel");
//var fs = require("fs");
var proxyModule = require("./proxy");
var filePath = require("path");
var snippetUtils = require("./snippet").utils;

var utils = {
    /**
     * Wait for 1 second
     * @returns {Function}
     */
    navigateCallback: function (io, options) {

        var disabled = false;
        var navigating = false;

        return function (req, res, next) {

            if (options && options.ghostMode && options.ghostMode.links) {

                if (!snippetUtils.isExcluded(req) && req.method === "GET") {

                    var clients = io.sockets.clients();

                    if (clients.length && !disabled && !navigating) {

                        navigating = true;
                        disabled = true;

                        io.sockets.emit("location:update", {
                            url: req.url
                        });

                        var timer = setTimeout(function () {

                            disabled = false;
                            navigating = false;
                            clearInterval(timer);

                        }, 1000);
                    }
                }
            }
            next();
        };
    }
};
module.exports.utils = utils;

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {{socket: (Number), controlPanel: (Number)}} ports
 * @param {Object} options
 * @param {socket} io
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
module.exports.launchServer = function (host, ports, options, io) {

    var proxy  = options.proxy || false;
    var server = options.server || false;
    var app;
    var staticServer, proxyServer;
    var navCallback = utils.navigateCallback(io, options);

    if (proxy) {
        proxyServer = proxyModule.createProxy(host, ports, options, navCallback);
    }

    if (server) {
        var baseDir = options.server.baseDir || "./";
        var index = options.server.index || "index.html";
        app = connect()
                .use(navCallback)
                .use(loadSnippet(host, ports, options))
                .use(connect.static(filePath.resolve(baseDir), { index: index }));
        staticServer = http.createServer(app).listen(ports.server);
    }


    return {
        staticServer : staticServer,
        proxyServer  : proxyServer
    };
};