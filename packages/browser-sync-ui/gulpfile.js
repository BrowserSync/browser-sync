"use strict";

var gulp        = require("gulp");
var jshint      = require("gulp-jshint");

/**
 * Lint all JS files
 */
gulp.task("lint", function () {
    return gulp.src([
        "test/client/specs/**/*.js",
        "test/server/**/*.js",
        "lib/**/*.js",
        "public/js/scripts/*.js",
        "index.js",
        "server/*.js",
        "gulpfile.js"
    ])
    .pipe(require("no-abs")())
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"));
});