/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 14:35:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-11 17:44:52
 */
'use strict';

const path = require('path');
const webpack = require('webpack');
const utils = require('./utils');
const VueLoaderPlugin = require('vue-loader').VueLoaderPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

process.env.NODE_ENV = 'development';

module.exports = {
  mode: 'development',
  context: process.cwd(),
  target: 'web', // webpack5.x 加上之后热更新才有效果
  devtool: 'eval-cheap-source-map',
  entry: {
    app: utils.resolve('website/index.ts'),
  },
  output: {
    path: utils.resolve('dist'),
    filename: 'js/[name].js',
    publicPath: '/',
  },
  // node: {
  //   setImmediate: false,
  //   process: 'mock',
  //   dgram: 'empty',
  //   fs: 'empty',
  //   net: 'empty',
  //   tls: 'empty',
  //   child_process: 'empty'
  // },
  resolve: {
    // 配置解析规则
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm-bundler.js',
      '@': utils.resolve('website'),
    },
    fallback: {
      crypto: false,
      stream: false,
      buffer: false,
    },
  },
  experiments: {
    topLevelAwait: true,
  },
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
      // css
      {
        test: /\.css?$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      // scss
      {
        test: /\.scss?$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
          {
            loader: 'style-resources-loader',
            options: {
              patterns: [utils.resolve('website/assets/variables.scss')],
            },
          },
        ],
      },
      // do not base64-inline SVG
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // images
      {
        test: /\.(png|jpe?g|gif|webp)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'img/[contenthash:8][ext][query]' },
      },
      // fonts
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'fonts/[contenthash:8][ext][query]' },
      },
      // media
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: { filename: 'media/[contenthash:8][ext][query]' },
      },
    ],
  },
  devServer: {
    clientLogLevel: 'warning',
    /* 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html */
    historyApiFallback: {
      disableDotRule: true,
      rewrites: [{ from: /.*/, to: utils.resolve('dist/index.html') }],
    },
    publicPath: '/',
    contentBase: utils.resolve('dist'),
    inline: true,
    hot: true, // 热加载
    compress: true, // 开启资源的 gzip 压缩
    overlay: {
      warnings: false,
      errors: true,
    },
    host: 'localhost',
    port: '8081',
    open: true,
    proxy: {},
    watchOptions: { poll: false },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'public/index.html',
      favicon: 'public/favicon.ico',
      inject: true,
    }),
  ],
};
