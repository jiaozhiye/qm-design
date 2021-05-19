/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 10:27:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-18 23:09:50
 */
import { deepFindRowKey, isArrayContain } from '../utils';
import { t } from '../../../locale';
import { Nullable } from '../../../_utils/types';
import { IDerivedColumn, IRecord } from '../table/types';
import config from '../config';

const selectionMixin = {
  methods: {
    // 创建选择列
    createSelectionColumn(options): Nullable<IDerivedColumn> {
      if (!options) {
        return null;
      }
      const { type } = options;
      return {
        dataIndex: '__selection__',
        title: type === 'radio' ? t('qm.table.config.selectionText') : '',
        width: config.selectionColumnWidth,
        fixed: 'left',
        type,
      };
    },
    createTreeSelectionKeys(key: string, arr: string[]): string[] {
      const { deriveRowKeys } = this;
      const target = deepFindRowKey(deriveRowKeys, key);
      const childRowKeys = this.getAllChildRowKeys(target?.children || []);
      const parentRowKeys = this.findParentRowKeys(deriveRowKeys, key);
      // 处理后代节点
      arr = [...new Set([...arr, ...childRowKeys])];
      // 处理祖先节点
      parentRowKeys.forEach((x) => {
        const target = deepFindRowKey(deriveRowKeys, x);
        const isContain = isArrayContain(arr, target?.children?.map((k) => k.rowKey) || []);
        if (isContain) {
          arr = [...arr, x];
        } else {
          arr = arr.filter((k) => k !== x);
        }
      });
      return arr;
    },
    createSelectionRows(selectedKeys: string[]): IRecord[] {
      const { allTableData, allRowKeys, selectionRows, getRowKey, isFetch } = this;
      if (isFetch) {
        return [
          ...selectionRows.filter((row) => selectedKeys.includes(getRowKey(row, row.index))),
          ...allTableData.filter((row) => {
            let rowKey = getRowKey(row, row.index);
            return selectedKeys.includes(rowKey) && selectionRows.findIndex((row) => getRowKey(row, row.index) === rowKey) === -1;
          }),
        ];
      }
      return selectedKeys.map((x) => {
        let index = allRowKeys.findIndex((key) => key === x);
        return allTableData[index];
      });
    },
    // 选择列已选中 keys
    createSelectionKeys(keys: string[]): string[] {
      const { rowSelection, selectionKeys, isTreeTable } = this;
      const { type, checkStrictly = !0 } = rowSelection || {};
      const rowSelectionKeys = Array.isArray(keys) ? keys : selectionKeys;
      let result: string[] = [];
      if (isTreeTable && !checkStrictly) {
        rowSelectionKeys.forEach((x) => {
          result.push(...this.createTreeSelectionKeys(x, rowSelectionKeys));
        });
      }
      const selectedKeys = type === 'radio' ? rowSelectionKeys.slice(0, 1) : [...new Set([...rowSelectionKeys, ...result])];
      this.selectionRows = this.createSelectionRows(selectedKeys);
      return selectedKeys;
    },
  },
};

export default selectionMixin;
