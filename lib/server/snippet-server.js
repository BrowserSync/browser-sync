"use strict";

var connect = require("connect");
var http    = require("http");

/**
 * Create a server for the snippet
 * @param {BrowserSync} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createSnippetServer (bs, scripts) {

    var app = connect();

    app.use(bs.options.getIn(["scriptPaths", "versioned"]), scripts)
       .use(bs.options.getIn(["scriptPaths", "path"]),      scripts);

    return {
        server: http.createServer(app),
        app:    app
    };
};
