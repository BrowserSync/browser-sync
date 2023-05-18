/**
 *
 * Install:
 *      npm install browser-sync
 *
 * Run:
 *      node <yourfile.js>
 *
 * This example shows how you can place the snippet anywhere.
 */

"use strict";

var path = require("path");
var browserSync = require("../packages/browser-sync").create();
var cwd = path.join(__dirname, "..");
var fixtures_dir = path.join(cwd, "packages/browser-sync/test/fixtures");

browserSync.init({
    files: [path.join(fixtures_dir, "css/*.css")],
    server: fixtures_dir,
    snippetOptions: {
        rule: {
            match: /<\/head>/i,
            fn: function(snippet, match) {
                return snippet + match;
            }
        }
    }
});
