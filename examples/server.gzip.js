/**
 *
 * Install:
 *      npm install browser-sync compression
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server with gzip enabled
 *
 */

"use strict";

var browserSync = require("browser-sync").create();
var compression = require("compression");

browserSync.init({
    files: ["app/css/*.css"],
    server: {
        baseDir: "app",
        middleware: compression()
    }
});
