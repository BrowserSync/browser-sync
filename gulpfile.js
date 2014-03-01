var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
    gulp.src(['test/**/*.js', '!test/fixtures/**', 'lib/*'])
        .pipe(jshint('test/.jshintrc'))
        .pipe(jshint.reporter('fail'))
});

gulp.task('default', ['lint']);