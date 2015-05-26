/**
 *
 * Install:
 *      npm install browser-sync compression
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will proxy to your existing vhost
 * and serve gzipped responses
 *
 */

"use strict";

var browserSync = require("browser-sync").create();
var compression = require("compression");

browserSync.init({
    files: ["app/css/*.css"],
    proxy: {
        target: "http://yourlocal.dev",
        middleware: compression()
    }
});
