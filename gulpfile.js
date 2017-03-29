/*
 * Wire
 * Copyright (C) 2016 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

var args = require('yargs').argv;
var assets = require('gulp-bower-assets');
var babel = require('gulp-babel');
var bower = require('gulp-bower');
var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var gulpTypings = require('gulp-typings');
var gutil = require('gulp-util');
var Jasmine = require('jasmine');
var merge = require('merge2');
var ProgressPlugin = require('webpack/lib/ProgressPlugin');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var ts = require('gulp-typescript');
var tsProjectNode = ts.createProject('tsconfig.json');
var webpack = require('webpack');

// Aliases
gulp.task('b', ['build']);
gulp.task('bn', ['build_ts_node']);
gulp.task('c', ['clean']);
gulp.task('i', ['install']);
gulp.task('t', ['test']);
gulp.task('tb', ['test_browser']);
gulp.task('tn', ['test_node']);

// Tasks
gulp.task('clean', ['clean_browser', 'clean_node'], function() {
});

gulp.task('clean_browser', function() {
  return gulp.src('dist/window').pipe(clean());
});

gulp.task('clean_node', function() {
  return gulp.src('dist/commonjs').pipe(clean());
});

gulp.task('build', function(done) {
  runSequence('build_ts_node', 'build_ts_browser', done);
});

gulp.task('build_ts_browser', function(callback) {
  var compiler = webpack(require('./webpack.config.js'));

  compiler.apply(new ProgressPlugin(function(percentage, message) {
    console.log(~~(percentage * 100) + '%', message);
  }));

  compiler.run(function(error) {
    if (error) {
      throw new gutil.PluginError('webpack', error);
    }

    callback();
  });
});

gulp.task('build_ts_node', function() {
  var tsResult = tsProjectNode.src().pipe(tsProjectNode());
  var disableLogging = Boolean(args.env === 'production');

  gutil.log(gutil.colors.yellow('Disable log statements: ' + disableLogging));

  return merge([
    tsResult.dts
      .pipe(gulp.dest('dist/typings')),
    tsResult.js
      .pipe(replace('exports.default = {', 'module.exports = {'))
      .pipe(gulpif(disableLogging, replace(/var Logdown[^\n]*/ig, '')))
      .pipe(gulpif(disableLogging, replace(/[_]?this.logger[^\n]*/igm, '')))
      .pipe(gulp.dest('dist/commonjs'))
  ]);
});

gulp.task('default', ['dist'], function() {
  gulp.watch('dist/**/*.*').on('change', browserSync.reload);
  gulp.watch('src/main/ts/**/*.*', ['build']);

  browserSync.init({
    port: 3636,
    server: {baseDir: './'},
    startPath: '/dist'
  });
});

gulp.task('dist', function(done) {
  runSequence('clean', 'install', 'build', done);
});

gulp.task('install', ['install_bower_assets', 'install_typings'], function() {
});

gulp.task('install_bower', function() {
  return bower({cmd: 'install'});
});

gulp.task('install_bower_assets', ['install_bower'], function() {
  return gulp.src('bower_assets.json')
    .pipe(assets({
      prefix: function(name, prefix) {
        return prefix + '/' + name;
      }
    }))
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('install_typings', function() {
  return gulp.src('./typings.json')
    .pipe(gulpTypings());
});

gulp.task('test', function(done) {
  runSequence('test_node', 'test_browser', done);
});

// gulp test_browser -file "yourspec"
gulp.task('test_browser', function(done) {
  var karma = require('karma');

  gutil.log(gutil.colors.yellow('Running tests in Google Chrome:'));
  var file = process.argv[4];

  var server = new karma.Server({
    configFile: __dirname + '/karma.conf.js',
    files: [
      // Libraries
      {pattern: 'dist/lib/dynamic/**/*.js', included: true, served: true, nocache: true},
      // Application
      'dist/window/**/*.js',
      // Tests
      (file) ? `test/${file}` : 'test/browser/**/*Spec.js',
      (file) ? undefined : 'test/common/**/*Spec.js'
    ],
    logLevel: (file) ? 'debug' : 'info'
  }, done);

  server.start();
});

gulp.task('test_node', function(done) {
  gutil.log(gutil.colors.yellow('Running tests on Node.js:'));

  var file = process.argv[4];

  var tests = [
    'common/**/*Spec.js',
    'node/**/*Spec.js'
  ];

  if (file) {
    tests = [file]
  }

  var jasmine = new Jasmine();

  var config = {
    random: true,
    spec_dir: 'test',
    spec_files: tests,
    stopSpecOnExpectationFailure: true,
  };

  jasmine.loadConfig(config);

  jasmine.onComplete(function(passed) {
    if (passed) {
      done();
    }
    else {
      done(new Error('At least one spec has failed.'));
    }
  });

  jasmine.execute();
});
