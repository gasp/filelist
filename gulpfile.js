var gulp = require('gulp');
var jasmine = require('gulp-jasmine');

gulp.task('default', function () {
    // nothing yet... a hint ?
});

gulp.task('test', function () {
    gulp.src('tests/listing.js')
        .pipe(jasmine());
});