/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example shows how to specify the proxy headers for each request
 *
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    files: ["app/css/*.css"],
    proxy: {
        target: "localhost:8000",
        reqHeaders: function(config) {
            /**
             * These are the default headers as a guide for you.
             * You can set whatever you want here.
             */
            return {
                host: config.urlObj.host,
                "accept-encoding": "identity",
                agent: false
            };
        }
    }
});
