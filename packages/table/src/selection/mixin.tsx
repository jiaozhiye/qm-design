/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 10:27:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 16:29:06
 */
import { deepFindRowKey, tableDataFlatMap, isArrayContain } from '../utils';
import { t } from '../../../locale';
import { Nullable } from '../../../_utils/types';
import { IDerivedColumn } from '../table/types';
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
    createSelectionRows(selectedKeys: string[]): void {
      const { tableFullData, selectionRows, getRowKey, isFetch } = this;
      const selectionRowKeys = selectionRows.map((row) => getRowKey(row, row.index));
      const uniqRecords = isFetch
        ? [
            ...selectionRows,
            ...tableDataFlatMap(tableFullData).filter((row) => {
              let rowKey = getRowKey(row, row.index);
              return selectedKeys.includes(rowKey) && !selectionRowKeys.includes(rowKey);
            }),
          ]
        : tableDataFlatMap(tableFullData);
      this.selectionRows = uniqRecords.filter((row) => selectedKeys.includes(getRowKey(row, row.index)));
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
      this.createSelectionRows(selectedKeys);
      return selectedKeys;
    },
  },
};

export default selectionMixin;
