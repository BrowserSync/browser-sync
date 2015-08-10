"use strict";

var gulp = require("gulp");
var contribs = require("gulp-contribs");
var conventionalChangelog = require("gulp-conventional-changelog");

gulp.task("contribs", function () {
    gulp.src("README.md")
        .pipe(contribs())
        .pipe(gulp.dest(""));
});

gulp.task("changelog", function () {
    return gulp.src("CHANGELOG.md", {
        buffer: false
    })
        .pipe(conventionalChangelog({
            preset: "angular"
        }))
        .pipe(gulp.dest("./"));
});
