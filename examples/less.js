/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will serve .less files
 * and allow them to be injected as a css file would be.
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    server: ["test/fixtures"],
    open: false,
    watch: true,
    injectFileTypes: ["css", "less"],
    middleware: [
        (req, res, next) => {
            if (req.url.indexOf("bootstrap.less") > -1) {
                res.setHeader("content-type", "text/css");
            }
            next();
        }
    ]
});
