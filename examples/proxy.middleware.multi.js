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

var browserSync = require("browser-sync");

var fn1 = function (req, res, next) {
    console.log(req.url);
    next();
};

var fn2 = function (req, res, next) {
    console.log(req.headers);
    next();
};

browserSync({
    files: ["app/css/*.css"],
    proxy: {
        target: "http://yourlocal.dev",
        middeware: [fn1, fn2]
    },
    https: true
});
