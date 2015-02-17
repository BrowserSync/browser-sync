/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server with gzip enabled
 *
 */

"use strict";

var browserSync = require("browser-sync");
var compression = require("compression");

browserSync({
    files: ["app/css/*.css"],
    server: {
        baseDir: "app",
        middleware: compression()
    }
});
