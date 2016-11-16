/**
 *
 * Install:
 *      npm install browser-sync http2
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server using http2 using the default information & use the `app` directory as the root
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    files: ["app/css/*.css"],
    server: {
        baseDir: "app"
    },
    https: true,
    httpModule: "http2"
});
