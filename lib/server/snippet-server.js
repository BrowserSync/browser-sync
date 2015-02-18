"use strict";

var connect = require("connect");
var http    = require("http");
var https   = require("https");
var utils   = require("./utils.js");

/**
 * Create a server for the snippet
 * @param {BrowserSync} bs
 * @param scripts
 * @returns {*}
 */
module.exports = function createSnippetServer (bs, scripts) {

    var options = bs.options;

    var app = connect();

    app.use(options.getIn(["scriptPaths", "versioned"]), scripts)
       .use(options.getIn(["scriptPaths", "path"]),      scripts);

    /**
     * Finally, return the server + App
     */
    return {
        server: (function () {
            return options.get("scheme") === "https"
                ? https.createServer(utils.getKeyAndCert(options), app)
                : http.createServer(app);
        })(app),
        app: app
    };
};
