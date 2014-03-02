var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('lint', function () {
    gulp.src(['test/specs/**/*.js', '!test/fixtures/**', 'lib/*'])
        .pipe(jshint('test/specs/.jshintrc'))
        .pipe(jshint.reporter('fail'))
});

gulp.task('default', ['lint']);