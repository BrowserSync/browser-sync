/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example shows how you can access information about Browsersync when it's running
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

var config = {
    proxy: "localhost:8000",
    files: ["app/css/*.css"]
};

browserSync.init(config, function(err, bs) {
    // Full access to Browsersync object here
    console.log(bs.getOption("urls"));
});
