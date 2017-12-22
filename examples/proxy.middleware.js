/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a proxy server and run middlewares
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    files: ["app/css/*.css"],
    proxy: {
        target: "http://yourlocal.dev",
        middleware: function(req, res, next) {
            console.log(req.url);
            next();
        }
    },
    https: true
});
