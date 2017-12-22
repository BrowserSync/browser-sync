/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will proxy http://www.bbc.co.uk and
 * add headers to the response *after* it's returned from
 * the server.
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    proxy: {
        target: "http://www.bbc.co.uk",
        proxyRes: [
            function(res) {
                res.headers["cache-control"] = "private";
            }
        ]
    }
});
