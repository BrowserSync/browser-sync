/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server using https using the default information & use the `app` directory as the root
 *
 */

"use strict";

var browserSync = require("browser-sync");

browserSync.init(["app/css/*.css"], {
    server: {
        baseDir: "app"
    },
    https: true
});
