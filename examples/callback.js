/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example shows how you can access information about BrowserSync when it's running
 *
 */

"use strict";

var browserSync = require("browser-sync");

var config = {
    proxy: "localhost:8000",
    files: ["app/css/*.css"]
};

browserSync(config, function (err, bs) {
    // Full access to BrowserSync object here
    console.log(bs.getOption("urls"));
});
