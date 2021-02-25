/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-25 19:39:41
 */
import { defineComponent } from 'vue';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import { get } from 'lodash-es';
import { t } from '../../locale';
import { noop, deepFindValues } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormCascader',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    const { form } = this.$$form as any;
    const { fieldName } = this.option;
    return {
      cascaderValue: this.createCascaderValue(form[fieldName]),
      itemList: [],
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
  },
  watch: {
    fetchParams(): void {
      this.getItemList();
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    createFormValue(vals: any): string | string[] {
      if (!this.multiple) {
        return vals.join(',');
      }
      return vals.map((arr) => arr.join(','));
    },
    createCascaderValue(val: string | string[] = ''): any[] {
      if (!this.multiple) {
        return (val as string).split(',');
      }
      return (val as string[]).map((x) => x.split(','));
    },
    createViewText(val: string | string[] = ''): string {
      if (!this.multiple) {
        return deepFindValues(this.itemList, val as string)
          .map((option) => option.text)
          .join('/');
      }
      return (val as string[])
        .map((x) => {
          return deepFindValues(this.itemList, x)
            .map((option) => option.text)
            .join('/');
        })
        .join(',');
    },
    async getItemList(): Promise<void> {
      const {
        fetchApi,
        params = {},
        datakey = '',
        valueKey = 'value',
        textKey = 'text',
      } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
      }
    },
  },
  render(): JSXNode {
    const { multiple, isFetch } = this;
    const { form } = this.$$form;
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      request = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    this.$$form.setViewValue(fieldName, this.createViewText(form[fieldName]));
    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth && getParserWidth(labelWidth)}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel(labelOptions),
        }}
      >
        <el-cascader
          v-model={this.cascaderValue}
          props={{ children: 'children', label: 'text', multiple }}
          options={this.itemList}
          clearable={clearable}
          disabled={disabled}
          placeholder={placeholder}
          style={{ ...style }}
          filterable
          collapse-tags
          show-all-levels
          onChange={() => {
            form[fieldName] = this.createFormValue(this.cascaderValue);
            onChange(form[fieldName]);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
