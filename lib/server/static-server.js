"use strict";

var connect      = require("connect");
var utils        = require("./utils.js");
var snippetUtils = require("./../snippet").utils;

/**
 * @param {BrowserSync} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createServer (bs, scripts) {

    var options    = bs.options;
    var server     = options.get("server");
    var middleware = options.get("middleware");
    var index      = server.get("index") || "index.html";
    var basedir    = server.get("baseDir");

    var app = connect();

    /**
     * Handle Old IE
     */
    app.use(utils.handleOldIE);

    /**
     * Server the Client-side JS from both version and static paths
     */
    app.use(options.getIn(["scriptPaths", "versioned"]), scripts)
        .use(options.getIn(["scriptPaths", "path"]),      scripts);

    /**
     * Add directory middleware
     */
    if (server.get("directory")) {
        utils.addDirectory(app, basedir);
    }

    /**
     * Add snippet injection middleware
     */
    app.use(
        snippetUtils.getSnippetMiddleware(
            options.get("snippet"),
            options.get("snippetOptions")
        )
    );

    /**
     * Add user-provided middlewares
     */
    utils.addMiddleware(app, middleware);

    /**
     * Add Serve static middlewares
     */
    utils.addBaseDir(app, basedir, index);

    /**
     * Add further Serve static middlewares for routes
     */
    if (server.get("routes")) {
        utils.addRoutes(app, server.get("routes").toJS());
    }

    /**
     * Finally, return the server + App
     */
    return utils.getServer(app, bs.options);
};
