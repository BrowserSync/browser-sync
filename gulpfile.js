"use strict";

var gulp = require("gulp");
var bs = require("./").create();
var Rx = require("rx");
// var contribs = require("gulp-contribs");
// var conventionalChangelog = require("gulp-conventional-changelog");
//
// gulp.task("contribs", function () {
//     gulp.src("README.md")
//         .pipe(contribs())
//         .pipe(gulp.dest(""));
// });
//
// gulp.task("changelog", function () {
//     return gulp.src("CHANGELOG.md", {
//         buffer: false
//     })
//         .pipe(conventionalChangelog({
//             preset: "angular"
//         }))
//         .pipe(gulp.dest("./"));
// });

gulp.task("dev", function() {

    bs.init({
        server: "test/fixtures",
        open: false,
        reloadDelay: 1000,
        reloadDebounce: 1000
    });

    gulp.src("lib/**")
        .pipe(bs.stream())
});
