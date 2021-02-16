/*
 * @Author: 焦质晔
 * @Date: 2021-02-12 09:22:19
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-16 17:39:35
 */
'use strict';

import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import vuePlugin from 'rollup-plugin-vue';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import jsx from 'acorn-jsx';
import pkg from '../package.json';
const utils = require('./utils');

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const deps = Object.keys(pkg.dependencies);

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
        abortOnError: false,
      }),
      commonjs({ extensions }),
      babel({ babelHelpers: 'runtime', extensions }),
    ],
    acornInjectPlugins: [jsx()],
    external(id) {
      return /^vue/.test(id) || deps.some((k) => new RegExp('^' + k).test(id));
    },
  },
];
