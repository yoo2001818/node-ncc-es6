var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
require('babel-core/register');

// TODO: Add code coverage tool

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('mocha', function() {
  return gulp.src(['test/**/*.js'], { read: false })
    .pipe(mocha({ reporter: 'list' }))
});

gulp.task('test', ['lint', 'mocha']);

gulp.task('watch', function() {
  return gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});

gulp.task('default', ['test'], function() {
  return gulp.src('src/index.js')
    .pipe(babel())
    .pipe(gulp.dest('bin'));
});
