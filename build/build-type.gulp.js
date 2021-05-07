/*
 * @Author: 焦质晔
 * @Date: 2021-02-15 10:50:25
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 21:51:05
 */
'use strict';

/* eslint-disable @typescript-eslint/no-var-requires */
const { series, src, dest } = require('gulp');
const ts = require('gulp-typescript');
const ignore = require('gulp-ignore');
const rename = require('gulp-rename');
const tsProject = ts.createProject('../tsconfig.json');
const utils = require('./utils');

function compile() {
  const tsResult = tsProject
    .src()
    .pipe(ignore.include(['packages/**/*', 'typings/vue-shim.d.ts']))
    .pipe(tsProject());
  return tsResult.dts.pipe(dest(utils.resolve('lib')));
}

function copydts() {
  return src(utils.resolve('typings/vue-shim.d.ts'))
    .pipe(rename('qm-design.d.ts'))
    .pipe(dest(utils.resolve('lib')));
}

exports.build = series(compile, copydts);
