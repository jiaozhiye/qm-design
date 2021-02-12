/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 09:22:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-12 11:45:55
 */
'use strict';

import vuePlugin from 'rollup-plugin-vue';
import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import pkg from '../package.json';
const deps = Object.keys(pkg.dependencies);
const utils = require('./utils');

export default [
  {
    input: utils.resolve('packages/index.ts'),
    output: {
      format: 'es',
      file: 'lib/index.esm.js',
    },
    plugins: [
      terser(),
      nodeResolve(),
      vuePlugin({
        target: 'browser',
        css: false,
        exposeFilename: false,
      }),
      typescript({
        tsconfigOverride: {
          include: ['packages/**/*', 'typings/vue-shim.d.ts'],
          exclude: ['node_modules'],
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
    ],
    external(id) {
      return /^vue/.test(id) || deps.some((k) => new RegExp('^' + k).test(id));
    },
  },
];
