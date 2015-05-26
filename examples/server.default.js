/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server in the cwd.
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    files: ["app/css/*.css"],
    server: true
});
