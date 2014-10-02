"use strict";

var messages     = require("./../messages");
var snippetUtils = require("./../snippet").utils;
var utils        = require("./utils.js");
var mainUtils    = require("./../utils");
var log          = mainUtils.log;
var tunnel       = require("../tunnel");
var connect      = require("connect");
var _            = require("lodash");
var http         = require("http");
var https        = require("https");
var simpleProxy  = require("./proxy/index");
var fs           = require("fs");
var url          = require("url");

/**
 *
 */
module.exports.plugin = function (bs, scripts) {

    var options = bs.options;
    var debug   = bs.debug;
    var proxy   = options.proxy   || false;
    var server  = options.server  || false;

    var snippet    = (!server && !proxy);
    var baseDir    = mainUtils.getBaseDir(server.baseDir || "./");
    var type       = "snippet";
    var events     = bs.events;

    if (options.server) {
        options.server.middleware = bs.pluginManager.hook("server:middleware", server.middleware || null);
    }

    var bsServer   = exports.createServer(options, scripts, bs);

    if (server || snippet) {
        debug("Static Server running ({magenta:%s}) ...", options.https ? "https" : "http");
        type = server ? "server" : "snippet";
    }

    if (proxy) {
        debug("Proxy running, proxing: {magenta:%s}", options.proxy.target);
        type = "proxy";
    }

    if (bsServer) {
        bs.server = bsServer.listen(options.port);
    }

    debug("Running mode: %s", type.toUpperCase());

    if (type && (server || proxy)) {
        if (options.tunnel && options.online) {
            bs.pluginManager.get("tunnel")(bs, options.port, finished);
        } else {
            finished(options.urls.local);
        }
    } else {
        finished("n/a");
    }

    function finished(url, tunnel) {

        if (tunnel) {
            bs.options.urls.tunnel = url;
        }

        events.emit("service:running", {
            type: type,
            baseDir: baseDir || null,
            port: options.port,
            url: url,
            tunnel: tunnel ? url : false
        });
    }

    return bsServer;
};

/**
 * Launch the server for serving the client JS plus static files
 * @param {Object} options
 * @param {String} scripts
 * @param {BrowserSync} bs
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
module.exports.createServer = function (options, scripts, bs) {

    var proxy = options.proxy   || false;
    var server = options.server || false;

    options.snippet     = messages.scriptTags(options.port, options);
    options.scriptPaths = messages.clientScript(options, true);

    if (!proxy && !server) {
        return createSnippetServer(options, scripts, bs);
    }

    if (options.proxy) {
        return exports.createProxy(options, scripts, bs);
    }

    if (options.server) {
        return createServer(options, scripts, bs);
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
    var secure     = (options.https !== undefined && options.https !== false);

    var secureKey, secureCert;

    var index, app;

    index = server.index || "index.html";

    app = context.app = connect();
    context.connect = connect;

    utils.addMiddleware(app, middleware);

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
 * @returns {*}
 * @param {BrowserSync} bs
 */
module.exports.createProxy = function(options, scripts, bs) {
    exports.checkProxyTarget(options.proxy, function (err) {
        if (err) {
            bs.events.emit("config:warn", {msg: err});
        }
    });

    return simpleProxy.init(
        options.proxy,
        {
            host: options.host,
            port: options.port
        },
        snippetUtils.getRegex(options.snippet),
        snippetUtils.getProxyMiddleware(scripts, options.scriptPaths.versioned),
        function(){}
    );
};

/**
 * @param {Object} proxy
 * @param {Function} cb
 */
module.exports.checkProxyTarget = function(proxy, cb) {

    var chunks  = [];
    var errored = false;
    var parsedUrl = url.parse(proxy.target);
    var options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      rejectUnauthorized: false
    };

    function logError() {
        if (!errored) {
            cb("Proxy address not reachable - is your server running?");
            errored = true;
        }
    }

    var req = require(proxy.protocol === "https" ? "https" : "http").get(options,  function (res) {
        res.on("data", function (data) {
            chunks.push(data);
        });
        res.on("end", function() {
            cb(null, 200);
        });
    }).on("error", function (err) {
        if (_.contains(["ENOTFOUND", "ECONNREFUSED"], err.code)) {
            logError();
        }
    }).on("close", function () {
        if (!chunks.length) {
            logError();
        }
    });

    req.on("socket", function (socket) {
        socket.setTimeout(5000);
        socket.on("timeout", function() {
            req.abort();
        });
    });
};