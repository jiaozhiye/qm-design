/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 18:20:53
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 18:28:11
 */
import { ValueOf } from '../../_utils/types';
import { IFormData, IFormItem } from './types';

export const PublicMethodsMixin = {
  // 公开方法
  methods: {
    // 设置表单项的值，参数是表单值得集合 { fieldName: val, ... }
    SET_FIELDS_VALUE(values: IFormData = {}): void {
      for (const key in values) {
        if (this.fieldNames.includes(key)) {
          const item: IFormItem = this.formItemList.find((x) => x.fieldName === key);
          this.form[key] = this.getInitialValue(item, values[key]);
        }
      }
    },
    SET_FORM_VALUES(values: IFormData = {}): void {
      for (const key in values) {
        if (this.fieldNames.includes(key)) {
          this.SET_FIELDS_VALUE({ [key]: values[key] });
        } else {
          this.form[key] = values[key];
        }
      }
    },
    SUBMIT_FORM(): void {
      this.submitForm();
    },
    RESET_FORM(): void {
      this.resetForm();
    },
    CLEAR_FORM(): void {
      this.clearForm();
    },
    VALIDATE_FIELDS<T extends string>(fieldNames: T[] | T): void {
      const fields: string[] = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      fields.forEach((fieldName) => this.formItemValidate(fieldName));
    },
    CREATE_FOCUS(fieldName: string): void {
      const formItem: IFormItem = this.formItemList.find((x) => x.fieldName === fieldName);
      if (!formItem) return;
      this.$refs[`${formItem.type}-${fieldName}`]?.focus();
    },
    async GET_FORM_DATA(): Promise<any[]> {
      try {
        const res = await this.formValidate();
        return [false, this.formatFormValue(res)];
      } catch (err) {
        return [err, null];
      }
    },
    GET_FIELD_VALUE(fieldName: string): ValueOf<IFormData> {
      return this.form[fieldName];
    },
  },
};
