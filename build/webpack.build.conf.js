/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-11 16:11:14
 */
'use strict';

const path = require('path');
const webpack = require('webpack');
const utils = require('./utils');
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;

process.env.NODE_ENV = 'production';

module.exports = {
  mode: 'production',
  context: process.cwd(),
  devtool: false,
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
    fallback: {
      crypto: false,
      stream: false,
      buffer: false,
    },
  },
  externals: [
    {
      vue: {
        root: 'Vue',
        commonjs: 'vue',
        commonjs2: 'vue',
      },
    },
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

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new VueLoaderPlugin(),
  ],
};
