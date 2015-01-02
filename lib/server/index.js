"use strict";

var snippetUtils = require("./../snippet").utils;
var utils        = require("./utils.js");
var connect      = require("connect");
var _            = require("lodash");
var http         = require("http");
var Immutable    = require("immutable");
var https        = require("https");
var foxy         = require("foxy");
var fs           = require("fs");

/**
 *
 */
module.exports.plugin = function (bs, scripts) {

    var debug   = bs.debug;
    var proxy   = bs.options.get("proxy")   || false;
    var server  = bs.options.get("server")  || false;
    var serverObj;

    var snippet    = (!server && !proxy);
    var type       = bs.options.get("mode");

    if (server) {
        serverObj = server.toJS();
        serverObj.middleware = bs.pluginManager.hook("server:middleware", server.get("middleware") || null);
        bs.setOption("server", Immutable.fromJS(serverObj));
    }

    var bsServer   = exports.createServer(bs.options, scripts, bs);

    if (server || snippet) {
        debug("Static Server running ({magenta:%s}) ...", bs.options.get("scheme"));
    }

    if (proxy) {
        debug("Proxy running, proxing: {magenta:%s}", proxy.get("target"));
    }

    if (bsServer) {
        bsServer.listen(bs.options.get("port"));
    }

    debug("Running mode: %s", type.toUpperCase());

    return bsServer;
};

/**
 * Launch the server for serving the client JS plus static files
 * @param {Object} options
 * @param {String} clientScripts
 * @param {BrowserSync} bs
 * @returns {{staticServer: (http.Server), proxyServer: (http.Server)}}
 */
module.exports.createServer = function (options, clientScripts, bs) {

    var proxy  = options.get("proxy");
    var server = options.get("server");

    if (!proxy && !server) {
        return createSnippetServer(options, clientScripts, bs);
    }

    if (proxy) {
        return exports.createProxy(options, clientScripts, bs);
    }

    if (server) {
        return createServer(server, options, clientScripts, bs);
    }
};

/**
 * @param {Immutable.Map} server
 * @param {Immutable.Map} options
 * @param scripts
 * @param context
 * @returns {*}
 */
function createServer (server, options, scripts, context) {

    var middleware = server.get("middleware");
    var secure     = options.get("scheme") === "https";
    var secureKey, secureCert;
    var index, app;

    index = server.get("index") || "index.html";

    app = context.app = connect();
    context.connect = connect;

    app.use(function (req, res, next) {
        snippetUtils.isOldIe(req);
        return next();
    })
    .use(options.getIn(["scriptPaths", "versioned"]), scripts)
    .use(options.getIn(["scriptPaths", "path"]), scripts);

    if (server.get("directory")) {
        utils.addDirectory(app, server.get("baseDir"));
    }

    app.use(snippetUtils.getSnippetMiddleware(options.get("snippet"), options.get("snippetOptions")));

    utils.addMiddleware(app, middleware);

    utils.addBaseDir(app, server.get("baseDir"), index);

    if (server.get("routes")) {
        utils.addRoutes(app, server.get("routes").toJS());
    }

    if (secure) {
        secureKey  = fs.readFileSync(secure.key  || __dirname + "/certs/server.key");
        secureCert = fs.readFileSync(secure.cert || __dirname + "/certs/server.crt");
        return https.createServer({key: secureKey, cert: secureCert}, app);
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
function createSnippetServer (options, scripts, context) {

    var app = context.app = connect();
    context.connect = connect;

    app.use(options.getIn(["scriptPaths", "versioned"]), scripts)
        .use(options.getIn(["scriptPaths", "path"]), scripts);

    return http.createServer(app);
}

/**
 * @param options
 * @param scripts
 * @returns {*}
 * @param {BrowserSync} bs
 */
module.exports.createProxy = function (options, scripts, bs) {

    exports.checkProxyTarget(options.get("proxy"), function (err) {
        if (err) {
            bs.events.emit("config:warn", {msg: err});
        }
    });

    var snippetOptions = options.get("snippetOptions").toJS();

    return foxy(options.getIn(["proxy", "target"]), {
        rules:       snippetUtils.getRegex(options.get("snippet"), options.get("snippetOptions")),
        ignorePaths: snippetOptions.ignorePaths,
        middleware:  snippetUtils.getProxyMiddleware(scripts, options.getIn(["scriptPaths", "versioned"])),
        errHandler:  function (err) {
                bs.logger.debug("{red:[proxy error]} %s", err.message);
            }
        }
    );
};

/**
 * @param {Object} proxy
 * @param {Function} cb
 */
module.exports.checkProxyTarget = function (proxy, cb) {

    var chunks  = [];
    var errored = false;

    function logError() {
        if (!errored) {
            cb("Proxy address not reachable - is your server running?");
            errored = true;
        }
    }

    require("http").get(proxy.get("target"), function (res) {
        res.on("data", function (data) {
            chunks.push(data);
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
};
