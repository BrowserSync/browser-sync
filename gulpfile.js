var gulp = require('gulp');
var jshint = require('gulp-jshint');
var contribs = require('gulp-contribs');
var mocha = require('gulp-mocha');

gulp.task('lint', function () {
    gulp.src(['test/specs/**/*.js', '!test/fixtures/**', 'lib/*'])
        .pipe(jshint('test/specs/.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'))
});

gulp.task('contribs', function () {
    gulp.src('README.md')
        .pipe(contribs())
        .pipe(gulp.dest("./"))
});

gulp.task('test', function () {
    gulp.src('test/specs/cli-new/*.js')
        .pipe(mocha())
        .pipe(gulp.dest("./"))
});

gulp.task('default', ['lint']);
