// Preset ordering is reversed, so `@babel/typescript` will called first
// Do not put `@babel/typescript` before `@babel/env`, otherwise will cause a compile error
// See https://github.com/babel/babel/issues/12066
const plugins = ['@vue/babel-plugin-jsx', '@babel/plugin-proposal-class-properties'];

module.exports = {
  env: {
    lib: {
      presets: [],
      plugins,
    },
    web: {
      presets: [['@babel/preset-env', { modules: false, corejs: 3, useBuiltIns: 'usage' }]],
      plugins: plugins.concat(['@babel/plugin-transform-runtime', '@babel/plugin-syntax-dynamic-import']),
    },
  },
};
