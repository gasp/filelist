var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');


var paths = {
  tests: ['tests/*.js',],
  main: 'index.js'
};

gulp.task('default', function () {
    // nothing yet... a hint ?
});

gulp.task('lint', function() {
  return gulp.src(paths.main)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});


gulp.task('watch', function() {
  gulp.watch(paths.tests, ['test']);
  gulp.watch(paths.main, ['test','lint']);
});


gulp.task('test', function () {
    gulp.src('tests/listing.js')
        .pipe(jasmine());
});