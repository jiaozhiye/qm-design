/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-22 19:50:10
 */
'use strict';

const utils = require('./utils');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const { VueLoaderPlugin } = require('vue-loader');
// const pkg = require('../package.json');
// const deps = Object.keys(pkg.dependencies);

process.env.NODE_ENV = 'production';

module.exports = {
  mode: 'production',
  target: 'web',
  entry: utils.resolve('packages/index.ts'),
  output: {
    path: utils.resolve('lib'),
    publicPath: '/',
    filename: 'index.js',
    libraryTarget: 'umd',
    library: 'QmDesign',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  externals: [
    {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue',
      },
    },
    // function ({ context, request }, callback) {
    //   if (deps.some((k) => new RegExp('^' + k).test(request))) {
    //     return callback(null, `commonjs ${request}`);
    //   }
    //   callback();
    // },
    nodeExternals(),
  ],
  module: {
    rules: [
      // vue
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      // js jsx
      {
        test: /\.js(x)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      // ts tsx
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              happyPackMode: true,
              appendTsxSuffixTo: [/\.vue$/],
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
