/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server using https using a PFX certificate & use the `app` directory as the root
 *
 */

"use strict";

var browserSync = require("browser-sync");

browserSync({
    files: ["app/css/*.css"],
    server: {
        baseDir: "app"
    },
    https: {
        pfx: "lib/server/certs/browsersync.pfx"
    }
});

