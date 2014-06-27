"use strict";

var messages     = require("./../messages");
var snippetUtils = require("./../snippet").utils;
var utils        = require("./utils.js");
var fail         = require("./../utils").utils.fail;

var connect      = require("connect");
var http         = require("http");
var foxy         = require("foxy");

/**
 * Launch the server for serving the client JS plus static files
 * @param {String} host
 * @param {Number} port
 * @param {Object} options
 * @param {string|} scripts
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}|Boolean}
 */
module.exports.launchServer = function (host, port, options, scripts) {

    var proxy       = options.proxy || false;
    var server      = options.server || false;
    var snippet = false;
    if (!proxy && !server) {
        snippet = true;
    }
    var scriptTags    = options.snippet = messages.scriptTags(port, options);
    var scriptPaths   = messages.clientScript(options, true);
    var scriptPath    = options.scriptPath = scriptPaths.versioned;
    var app;
    var bsServer = false;

    if (proxy) {

        bsServer = foxy.init(
            options.proxy,
            {
                host: host,
                port: port
            },
            snippetUtils.getRegex(scriptTags),
            snippetUtils.getProxyMiddleware(scripts, scriptPath),
            function (err) {
                if (err.code === "ENOTFOUND") {
                    fail(messages.proxyError(err.code), options, true);
                }
            }
        );
    }

    if (server || snippet) {

        var baseDir, index, directory;

        if (server) {
            baseDir   = server.baseDir;
            index     = server.index || "index.html";
            directory = server.directory;
        }

        app = connect();

        if (server && server.middleware) {
            utils.addMiddleware(app, server.middleware);
        }

        if (server.logger) {
            app.use(connect.logger(server.logger));
        }

        app.use(function (req, res, next) {
                snippetUtils.isOldIe(req);
                return next();
            })
            .use(scriptPath, scripts)
            .use(scriptPaths.path, scripts);

        if (server) {

            if (directory) {
                utils.addDirectory(app, baseDir);
            }

            app.use(snippetUtils.getSnippetMiddleware(scriptTags));
            utils.addBaseDir(app, baseDir, index);

        }

        bsServer = http.createServer(app);
    }

    return bsServer;
};