/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 10:27:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-09 12:12:10
 */
import { warn } from '../../../_utils/error';

const expandableMixin = {
  methods: {
    // 创建展开列
    createExpandableColumn(options) {
      if (!options) {
        return null;
      }
      return {
        dataIndex: '__expandable__',
        title: '',
        width: 50,
        fixed: 'left',
        type: 'expand',
      };
    },
    // 展开行，已展开的 keys
    createRowExpandedKeys() {
      const { expandable, selectionKeys, allRowKeys, treeStructure, isTreeTable } = this;
      if (isTreeTable && expandable) {
        warn('Table', '树结构表格不能再设置展开行 `expandable` 参数');
      }
      // 树结构
      if (isTreeTable) {
        const { defaultExpandAllRows, expandedRowKeys = [] } = treeStructure || {};
        const mergedRowKeys = [...selectionKeys, ...expandedRowKeys];
        const result = [];
        if (mergedRowKeys.length) {
          mergedRowKeys.forEach((x) => {
            result.push(...this.findParentRowKeys(this.deriveRowKeys, x));
          });
        }
        return defaultExpandAllRows && !expandedRowKeys.length ? [...allRowKeys] : [...new Set([...expandedRowKeys, ...result])];
      }
      // 展开行
      if (expandable) {
        const { defaultExpandAllRows, expandedRowKeys = [] } = expandable || {};
        return defaultExpandAllRows && !expandedRowKeys.length ? [...allRowKeys] : [...expandedRowKeys];
      }
      return [];
    },
  },
};

export default expandableMixin;
