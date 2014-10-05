"use strict";

var gulp        = require("gulp");
var jshint      = require("gulp-jshint");
var jscs        = require("gulp-jscs");
var contribs    = require("gulp-contribs");
var rubySass    = require("gulp-ruby-sass");
var filter      = require("gulp-filter");
var browserSync = require("./index");

gulp.task("lint", function () {
    gulp.src([
        "{,{lib,test/specs}/**/}*.js",
        "!lib/{cli/cli-template,public/socket.io}.js",
        "!./example.*"
    ])
        .pipe(jscs(".jscs.json"))
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        .pipe(jshint.reporter("fail"));
});

gulp.task("contribs", function () {
    gulp.src("README.md")
        .pipe(contribs())
        .pipe(gulp.dest("./"));
});

gulp.task("default", ["lint"]);

var paths = {
    scss: "test/fixtures/scss/*.scss",
    css: "test/fixtures/css",
    cssGlob: "test/fixtures/assets/*.css",
    html: "test/fixtures/*.html"
};

gulp.task("sass", function () {
    browserSync.notify("Compiling SCSS files... Please Wait");
    return gulp.src(paths.scss)
        .pipe(rubySass({sourcemap: true}))
        .pipe(gulp.dest(paths.css))
        .pipe(filter("**/*.css"))
        .pipe(browserSync.reload({stream:true}));
});

/**
 * Start BrowserSync
 */
gulp.task("browser-sync", function () {

//    var clientScript = require("/Users/shakyshane/Sites/browser-sync-modules/browser-sync-client/index");
//
//    browserSync.use("client:script", clientScript.middleware, function (err) {
//        console.log(err);
//    });

    browserSync({
        server: {
            baseDir: "test/fixtures"
        },
        startPath: "sass.html"
    });
});

/**
 * Start BrowserSync
 */
gulp.task("browser-sync-css", function () {
    browserSync({
        server: {
            baseDir: "test/fixtures"
        }
    });
});

/**
 * Watch stuff
 */
gulp.task("watch", ["browser-sync"], function () {
    gulp.watch(paths.scss, ["sass"]);
//    gulp.watch(paths.html, ["bs-reload"]);
});

/**
 * Watch stuff
 */
gulp.task("watch-css", ["browser-sync-css"], function () {
    gulp.watch(paths.cssGlob, function (file) {
        browserSync.reload(file.path);
    });
    gulp.watch(paths.html, browserSync.reload);
});

gulp.task("docs", function () {

    var yuidoc = require("gulp-yuidoc");

    gulp.src(["./index.js", "./lib/default-config.js"])
        .pipe(yuidoc.parser({spaces: 4}))
        .pipe(gulp.dest("./doc"));
});
