/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a proxy server using https
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    files: ["app/css/*.css"],
    proxy: "https://yourlocal.dev"
});
