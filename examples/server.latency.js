/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will create a server & use the `app` directory as the root
 *  - any requests beginning with /json will have fake latency applied
 *  - for 3 seconds
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

function fakeLatency(req, res, next) {
    if (req.url.match(/^\/json/)) {
        setTimeout(next, 3000);
    } else {
        next();
    }
}

browserSync.init({
    files: ["app/css/*.css"],
    server: "app",
    middleware: [fakeLatency]
});
