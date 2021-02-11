/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 08:44:40
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-11 08:45:35
 */
const path = require('path');

exports.resolve = function (_path) {
  return path.join(__dirname, '..', _path);
};
