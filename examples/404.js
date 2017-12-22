/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will redirect all 404 requests to a
 * custom 404.html page
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init(
    {
        files: ["app/css/*.css"],
        server: {
            baseDir: "app"
        }
    },
    function(err, bs) {
        bs.addMiddleware("*", function(req, res) {
            res.writeHead(302, {
                location: "404.html"
            });
            res.end("Redirecting!");
        });
    }
);
