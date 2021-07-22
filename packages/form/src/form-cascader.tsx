/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-16 11:19:33
 */
import { defineComponent } from 'vue';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import { get } from 'lodash-es';
import { t } from '../../locale';
import { IDictDeep } from './types';
import { noop, deepFindValues, deepMapList } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormCascader',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    return {
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
    createFormValue(vals: any[] | null): string | string[] {
      if (!this.multiple) {
        return vals?.join(',') || '';
      }
      return vals?.map((arr) => arr.join(',')) || [];
    },
    createCascaderValue(val: string | string[] = ''): string[] | string[][] {
      if (!this.multiple) {
        return (val as string).split(',');
      }
      return (val as string[]).map((x) => x.split(','));
    },
    createViewText(val: string | string[] = ''): string {
      if (!this.multiple) {
        return deepFindValues<IDictDeep>(this.itemList, val as string)
          .map((option) => option.text)
          .join('/');
      }
      return (val as string[])
        .map((x) => {
          return deepFindValues<IDictDeep>(this.itemList, x)
            .map((option) => option.text)
            .join('/');
        })
        .join(',');
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = deepMapList<IDictDeep>(dataList, valueKey, textKey);
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
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    this.$$form.setViewValue(fieldName, this.createViewText(form[fieldName]));
    const wrapProps = {
      modelValue: this.createCascaderValue(form[fieldName]),
      'onUpdate:modelValue': (val): void => {
        form[fieldName] = this.createFormValue(val);
      },
    };
    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth ? getParserWidth(labelWidth) : ''}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <el-cascader
          {...wrapProps}
          props={{ children: 'children', label: 'text', multiple }}
          options={this.itemList}
          clearable={clearable}
          disabled={disabled}
          placeholder={!disabled ? placeholder : ''}
          style={{ ...style }}
          readonly={readonly}
          filterable
          collapse-tags
          show-all-levels
          onChange={() => {
            onChange(form[fieldName]);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
