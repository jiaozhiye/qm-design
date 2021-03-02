/*
 * @Author: 焦质晔
 * @Date: 2021-03-02 11:10:34
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-02 15:25:52
 */
import { reactive } from 'vue';
import { xor, isEqual, isUndefined } from 'lodash-es';
import { IFormItem } from './types';
import { Nullable } from '../../_utils/types';

export const LocalStorageMixin = {
  methods: {
    async getTableFieldsConfig(key: string): Promise<Nullable<any[]>> {
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
      return null;
    },
    async saveTableColumnsConfig(key: string, value: IFormItem[]): Promise<void> {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {
        // ...
      }
    },
    getLocalFields(): Array<IFormItem> {
      if (!this.uniqueKey) return;
      // 本地存储
      const localFields: IFormItem[] = JSON.parse(localStorage.getItem(this.uniqueKey));
      // 服务端获取
      if (!localFields) {
        this.getTableFieldsConfig(this.uniqueKey)
          .then((result) => {
            if (!result) return;
            localStorage.setItem(this.uniqueKey, JSON.stringify(result));
            this.initLocalfields();
          })
          .catch(() => {});
      }
      if (!localFields) return;
      const diffs: unknown[] = xor(
        localFields.map((x) => x.fieldName),
        this.list.map((x) => x.fieldName)
      );
      if (diffs.length > 0) {
        return this.list.map((item) => {
          const { fieldName } = item;
          const target: IFormItem = localFields.find((x) => x.fieldName === fieldName);
          if (!target) {
            return item;
          }
          if (!isUndefined(target.hidden)) {
            item.hidden = target.hidden;
          }
          return item;
        });
      }
      return localFields.map((x) => {
        const target = this.list.find((k) => k.fieldName === x.fieldName);
        return { ...target, ...x };
      });
    },
    setLocalFields(list: IFormItem[]): void {
      if (!this.uniqueKey) return;
      const result = list.map((x) => {
        const target: Partial<IFormItem> = {};
        if (!isUndefined(x.hidden)) {
          target.hidden = x.hidden;
        }
        return {
          fieldName: x.fieldName,
          label: x.label,
          ...target,
        };
      });
      const localFields = JSON.parse(localStorage.getItem(this.uniqueKey));
      if (isEqual(result, localFields)) return;
      // 本地存储
      localStorage.setItem(this.uniqueKey, JSON.stringify(result));
      // 服务端存储
      this.saveTableColumnsConfig(this.uniqueKey, result);
    },
    initLocalfields(): void {
      // 获取本地 list
      const localFields = this.getLocalFields();
      if (!localFields) return;
      this.$nextTick(() => this.fieldsChange?.(reactive(localFields)));
    },
  },
  created() {
    this.initLocalfields();
  },
};
