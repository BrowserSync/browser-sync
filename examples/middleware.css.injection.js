/**
 *
 * Install:
 *      npm install browser-sync less
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will process less files on the file and auto-inject them into
 * all browsers.
 *
 * Instead of .css, use <link rel='stylesheet' href='main.less'> with the following
 * Configuration to enable a super-fast development workflow.
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    /**
     * Which files to watch for changes
     */
    files: "src/*.less",
    /**
     * Base directory
     */
    server: "app",
    /**
     * Add .less to the list of files that will cause injection (instead of reload)
     */
    injectFileTypes: ["less"],
    /**
     * Catch all requests, if any are for .less files, recompile on the fly and
     * send back a CSS response
     */
    middleware: function(req, res, next) {
        var parsed = require("url").parse(req.url);
        if (parsed.pathname.match(/\.less$/)) {
            return less(parsed.pathname).then(function(o) {
                res.setHeader("Content-Type", "text/css");
                res.end(o.css);
            });
        }
        next();
    }
});

function less(src) {
    var f = require("fs")
        .readFileSync("src/" + src)
        .toString();
    return require("less").render(f);
}
