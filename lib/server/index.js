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
 * @param {String} scripts
 * @param {BrowserSync} context
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
module.exports.createServer = function (options, scripts, context) {

    var proxy = options.proxy || false;
    var server = options.server || false;

    options.snippet     = messages.scriptTags(options.port, options);
    options.scriptPaths = messages.clientScript(options, true);

    if (!proxy && !server) {
        return createSnippetServer(options, scripts, context);
    }

    if (options.proxy) {
        return createProxy(options, scripts, context);
    }

    if (options.server) {
        return createServer(options, scripts, context);
    }
};

/**
 * @param scripts
 * @param context
 * @param options
 * @returns {*}
 */
function createServer(options, scripts, context) {

    var server     = options.server;
    var middleware = server.middleware;
    var secure     = (options.https !== undefined);

    var secureKey, secureCert;

    var index, app;

    index = server.index || "index.html";

    app = context.app = connect();
    context.connect = connect;

    utils.addMiddleware(app, middleware);

    if (server.logger) {
        app.use(connect.logger(server.logger));
    }

    app.use(function (req, res, next) {
        snippetUtils.isOldIe(req);
        return next();
    })
    .use(options.scriptPaths.versioned, scripts)
    .use(options.scriptPaths.path, scripts);

    if (server.directory) {
        utils.addDirectory(app, server.baseDir);
    }

    app.use(snippetUtils.getSnippetMiddleware(options.snippet));

    utils.addBaseDir(app, server.baseDir, index);

    if (server.routes) {
        utils.addRoutes(app, server.routes);
    }

    if (secure) {
        secureKey = fs.readFileSync(secure.key || __dirname + "/certs/server.key");
        secureCert = fs.readFileSync(secure.cert || __dirname + "/certs/server.crt");
        return https.createServer({ key: secureKey, cert: secureCert }, app);
    } else {
        return http.createServer(app);
    }
}

/**
 * @param options
 * @param scripts
 * @param context
 * @returns {*}
 */
function createSnippetServer(options, scripts, context) {

    var app = context.app = connect();
    context.connect = connect;

    app.use(options.scriptPaths.versioned, scripts)
        .use(options.scriptPaths.path, scripts);

    return http.createServer(app);
}

/**
 * @param options
 * @param scripts
 * @param context
 * @returns {*}
 */
function createProxy(options, scripts, context) {

    return foxy.init(
        options.proxy,
        {
            host: options.host,
            port: options.port
        },
        snippetUtils.getRegex(options.snippet),
        snippetUtils.getProxyMiddleware(scripts, options.scriptPaths.versioned),
        function (err) {
            if (err.code === "ENOTFOUND") {
                fail(messages.proxyError(err.code), options, true);
            }
        }
    );
}