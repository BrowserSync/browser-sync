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

var fn1 = function(req, res, next) {
    console.log(req.url);
    next();
};

var fn2 = function(req, res, next) {
    console.log(req.headers);
    next();
};

browserSync.init({
    files: ["app/css/*.css"],
    proxy: {
        target: "http://yourlocal.dev",
        middleware: [fn1, fn2]
    },
    https: true
});
