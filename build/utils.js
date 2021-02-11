/*
 * @Author: 焦质晔
 * @Date: 2021-02-11 08:44:40
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-11 17:35:37
 */
const path = require('path');

exports.resolve = function (dir) {
  return path.join(__dirname, '..', dir);
};
