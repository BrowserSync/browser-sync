"use strict";

var messages     = require("./../messages");
var snippetUtils = require("./../snippet").utils;
var utils        = require("./utils.js");
var fail         = require("./../utils").utils.fail;

var connect      = require("connect");
var http         = require("http");
var https        = require("https");
var foxy         = require("foxy");
var fs           = require("fs");

/**
 * Launch the server for serving the client JS plus static files
 * @param {Object} options
 * @param {String|} scripts
 * @param {Array} mw
 * @param {BrowserSync} context
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}|Boolean}
 */
module.exports.launchServer = function (options, scripts, mw, context) {

    var proxy       = options.proxy || false;
    var server      = options.server || false;
    var secure      = (options.https !== undefined);
    var secureKey, secureCert;
    if(secure) {
        secureKey = fs.readFileSync(secure.key || __dirname + "/certs/server.key");
        secureCert = fs.readFileSync(secure.cert || __dirname + "/certs/server.crt");
    }

    var port = options.port;
    var host = options.host;
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

        var baseDir, index, directory, routes;

        if (server) {
            baseDir   = server.baseDir;
            index     = server.index || "index.html";
            directory = server.directory;
            routes    = server.routes;
        }

        app = context.app = connect();
        context.connect = connect;

        if (server) {
            utils.addMiddleware(app, mw);
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

            if (routes) {
                utils.addRoutes(app, routes);
            }
        }

        if (secure) {
            bsServer = https.createServer({ key: secureKey, cert: secureCert }, app);
        } else {
            bsServer = http.createServer(app);
        }

    }

    return bsServer;
};