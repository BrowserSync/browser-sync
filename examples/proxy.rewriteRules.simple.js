/**
 *
 * Install:
 *      npm install browser-sync serve-static
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example will
 *  1. create a proxy server for a live magento website
 *  2. serve static assets from your local `assets` directory
 *  3. rewrite HTML on the fly to make the live site use your local assets/css/core.css file
 *
 *      eg:      <link rel="stylesheet" href="http://www.magento-site.com/skin/frontend/rwd/assets/css/core.min.css"></link>
 *      becomes: <link rel="stylesheet" href="//localhost:3000/assets/css/core.css"></link>
 *
 *  4. watch files in the assets directory and reload/inject when anything changes
 */

"use strict";

var browserSync = require("browser-sync").create();

browserSync.init({
    proxy: "http://www.magento-site.com",
    files: ["assets"],
    middleware: require("serve-static")("."),
    rewriteRules: [
        {
            match: "skin/frontend/rwd/assets/css/core.min.css",
            replace: "assets/css/core.css"
        }
    ]
});
