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

const args = require('yargs').argv;
const assets = require('gulp-bower-assets');
const babel = require('gulp-babel');
const bower = require('gulp-bower');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gulpTypings = require('gulp-typings');
const gutil = require('gulp-util');
const jasmine = require('gulp-jasmine');
const karma = require('karma');
const merge = require('merge2');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const ts = require('gulp-typescript');
const tsProjectNode = ts.createProject('tsconfig.json');
const webpack = require('webpack');

// Aliases
gulp.task('b', ['build']);
gulp.task('c', ['clean']);
gulp.task('i', ['install']);
gulp.task('t', ['test']);

// Tasks
gulp.task('clean', ['clean_browser', 'clean_node'], () => {
});

gulp.task('clean_browser', () => gulp.src('dist/window').pipe(clean()));

gulp.task('clean_node', () => gulp.src('dist/commonjs').pipe(clean()));

gulp.task('build', done => {
  runSequence('build_ts_node', 'build_ts_browser', done);
});

gulp.task('build_ts_browser', callback => {
  const compiler = webpack(require('./webpack.config.js'));

  compiler.apply(new ProgressPlugin((percentage, message) => {
    console.log(`${~~(percentage * 100)}%`, message);
  }));

  compiler.run(error => {
    if (error) {
      throw new gutil.PluginError('webpack', error);
    }

    callback();
  });
});

gulp.task('build_ts_node', () => {
  const tsResult = tsProjectNode.src().pipe(tsProjectNode());
  const disableLogging = Boolean(args.env === 'production');

  gutil.log(gutil.colors.yellow(`Disable log statements: ${disableLogging}`));

  return merge([
    tsResult.dts
      .pipe(gulp.dest('dist/typings')),
    tsResult.js
      .pipe(replace('exports.default = {', 'module.exports = {'))
      .pipe(gulpif(disableLogging, replace(/(const|var) Logdown[^\n]*/ig, '')))
      .pipe(gulpif(disableLogging, replace(/[_]?this.logger[^\n]*/igm, '')))
      .pipe(gulp.dest('dist/commonjs'))
  ]);
});

gulp.task('default', ['dist'], () => {
  gulp.watch('dist/**/*.*').on('change', browserSync.reload);
  gulp.watch('src/main/ts/**/*.*', ['build']);

  browserSync.init({
    port: 3636,
    server: {baseDir: './'},
    startPath: '/dist'
  });
});

gulp.task('dist', done => {
  runSequence('clean', 'install', 'build', done);
});

gulp.task('install', ['install_bower_assets', 'install_typings'], () => {
});

gulp.task('install_bower', () => bower({cmd: 'install'}));

gulp.task('install_bower_assets', ['install_bower'], () => gulp.src('bower_assets.json')
  .pipe(assets({
    prefix(name, prefix) {
      return `${prefix}/${name}`;
    }
  }))
  .pipe(gulp.dest('dist/lib')));

gulp.task('install_typings', () => gulp.src('./typings.json')
  .pipe(gulpTypings()));

gulp.task('test', done => {
  runSequence('test_node', 'test_browser', done);
});

// gulp test_browser -file "yourspec"
gulp.task('test_browser', done => {
  gutil.log(gutil.colors.yellow('Running tests in Google Chrome:'));
  const file = process.argv[4];

  const server = new karma.Server({
    configFile: `${__dirname}/karma.conf.js`,
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

gulp.task('test_node', () => {
  gutil.log(gutil.colors.yellow('Running tests on Node.js:'));

  const file = process.argv[4];

  let tests = [
    'test/common/**/*Spec.js',
    'test/node/**/*Spec.js'
  ];

  if (file) {
    tests = [`test/js/specs/${file}`]
  }

  return gulp.src(tests)
    .pipe(jasmine({
      random: true,
      stopSpecOnExpectationFailure: true
    }));
});
