"use strict";

var gulp        = require("gulp");
var jshint      = require("gulp-jshint");
var contribs    = require("gulp-contribs");
var sass        = require("gulp-sass");
var rubySass    = require("gulp-ruby-sass");
var browserSync = require("./lib/index");

gulp.task("lint", function () {
    gulp.src(["test/specs/**/*.js", "!test/fixtures/**", "lib/*"])
        .pipe(jshint("test/specs/.jshintrc"))
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
    gulp.src(paths.scss)
        .pipe(rubySass())
        .pipe(gulp.dest(paths.css))
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

    browserSync.init(null, {
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
    browserSync.init({
        server: {
            baseDir: "test/fixtures"
        }
    });
});

/**
 * Reload task
 */
gulp.task("bs-reload", function () {
    browserSync.reload();
});

/**
 * Watch stuff
 */
gulp.task("watch", ["browser-sync"], function () {
    gulp.watch(paths.scss, ["sass"]);
    gulp.watch(paths.html, ["bs-reload"]);
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

