/*
 * @Author: 焦质晔
 * @Date: 2020-03-30 11:34:10
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 15:02:31
 */
import { xor, isEqual, isUndefined } from 'lodash-es';
import { noop } from '../../../_utils/util';
import { IColumn } from '../table/types';

const localStorageMixin = {
  methods: {
    async getTableColumnsConfig(key: string): Promise<unknown[] | void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {
        // ...
      }
    },
    async saveTableColumnsConfig(key: string, value: unknown): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {
        // ...
      }
    },
    getLocalColumns(): void {
      if (!this.uniqueKey) return;
      // 本地存储
      const localColumns = JSON.parse(localStorage.getItem(this.uniqueKey) as string);
      // 服务端获取
      if (!localColumns) {
        this.getTableColumnsConfig(this.uniqueKey)
          .then((result) => {
            if (!result) {
              return this.setLocalColumns(this.columns);
            }
            localStorage.setItem(this.uniqueKey, JSON.stringify(result));
            this.initLocalColumns();
          })
          .catch(() => {});
      }
      if (!localColumns) return;
      const diffs = xor(
        localColumns.map((x) => x.dataIndex),
        this.columns.map((x) => x.dataIndex)
      );
      if (diffs.length > 0) {
        return this.columns.map((column) => {
          const { dataIndex } = column;
          const target = localColumns.find((x) => x.dataIndex === dataIndex);
          if (!target) {
            return column;
          }
          if (!isUndefined(target.hidden)) {
            column.hidden = target.hidden;
          }
          if (!isUndefined(target.fixed)) {
            column.fixed = target.fixed;
          }
          if (!isUndefined(target.width)) {
            column.width = target.width;
          }
          if (!isUndefined(target.renderWidth)) {
            column.renderWidth = target.renderWidth;
          }
          return column;
        });
      }
      return localColumns.map((x) => {
        const target = this.columns.find((k) => k.dataIndex === x.dataIndex);
        if (isUndefined(x.fixed)) {
          delete target.fixed;
        }
        return { ...target, ...x };
      });
    },
    setLocalColumns(columns: IColumn[]): void {
      if (!this.uniqueKey) return;
      const result = columns.map((x) => {
        const target: any = {};
        if (!isUndefined(x.hidden)) {
          target.hidden = x.hidden;
        }
        if (!isUndefined(x.fixed)) {
          target.fixed = x.fixed;
        }
        if (!isUndefined(x.width)) {
          target.width = x.width;
        }
        if (!isUndefined(x.renderWidth)) {
          target.renderWidth = x.renderWidth;
        }
        return {
          dataIndex: x.dataIndex,
          ...target,
        };
      });
      const localColumns = JSON.parse(localStorage.getItem(this.uniqueKey) as string);
      if (isEqual(result, localColumns)) return;
      // 本地存储
      localStorage.setItem(this.uniqueKey, JSON.stringify(result));
      // 服务端存储
      this.saveTableColumnsConfig(this.uniqueKey, result);
    },
    initLocalColumns(): void {
      const { columnsChange = noop } = this;
      // 获取本地 columns
      const localColumns = this.getLocalColumns();
      if (!localColumns) return;
      columnsChange(localColumns);
    },
  },
  created() {
    this.initLocalColumns();
  },
};

export default localStorageMixin;
