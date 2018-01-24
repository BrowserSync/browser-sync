/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 */

"use strict";

var browserSync = require("../").create();

browserSync.init({
    open: false, // Stop auto open browser
    notify: {
        styles: [
            "display: none;",
            "padding: 6px 15px 3px;",
            "position: fixed;",
            "font-size: 40px;",
            "z-index: 9999;",
            "left: 0px;",
            "bottom: 0px;",
            "color: rgb(74, 74, 74);",
            "background-color: rgb(17, 17, 17);",
            "color: rgb(229, 229, 229);"
        ]
    },
    server: {
        baseDir: "test/fixtures"
    }
});
