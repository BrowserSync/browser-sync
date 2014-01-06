"use strict";

var messages = require("./messages");
var connect = require("connect");
var http = require("http");
var loadSnippet = require("./loadSnippet");
var fs = require("fs");
var proxyModule = require("./proxy");
var filePath = require("path");
var snippetUtils = require("./snippet").utils;

var utils = {
    /**
     * Append the socket connector
     * @param {String} host
     * @param {Number} port
     * @param {Object} options
     * @returns {Function}
     */
    modifySnippet: function (host, port, options) {

        var connector = messages.socketConnector(host, port);
        var jsFile    = fs.readFileSync(__dirname + messages.clientScript(options));
        var jsShims   = fs.readFileSync(__dirname + messages.client.shims);
        var result    = jsShims + connector + jsFile;

        return function (req, res) {
            res.setHeader("Content-Type", "text/javascript");
            res.end(result);
        };
    },
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
 * @param {Array} ports
 * @param {Object} options
 * @param {socket} io
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
module.exports.launchServer = function (host, ports, options, io) {

    var proxy  = options.proxy || false;
    var server = options.server || false;
    var app, modifySnippet = utils.modifySnippet(host, ports[0], options);
    var staticServer, proxyServer;
    var navCallback = utils.navigateCallback(io, options);

    // Serve the JS file manually for anything that doesn't use a server.
    if (!server) {
        app = connect().use(messages.clientScript(), modifySnippet);
    }

    if (proxy) {
        proxyServer = proxyModule.createProxy(host, ports, options, navCallback);
    } else {
        var baseDir = options.server.baseDir || "./";
        var index = options.server.index || "index.html";
        app = connect()
                .use(messages.clientScript(options), modifySnippet)
                .use(navCallback)
                .use(loadSnippet(host, ports[0], ports[1], options))
                .use(connect.static(filePath.resolve(baseDir), { index: index }));
    }

    staticServer = http.createServer(app).listen(ports[1]);

    return {
        staticServer : staticServer,
        proxyServer  : proxyServer
    };
};