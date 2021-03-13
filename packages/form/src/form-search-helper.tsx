/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-13 16:57:42
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { isFunction, get } from 'lodash-es';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import { warn } from '../../_utils/error';

type IColumn = {
  dataIndex: string;
  title: string;
};

export default defineComponent({
  name: 'FormSearchHelper',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  methods: {
    // 获取搜索帮助数据
    async querySearchAsync(request, fieldName: string, columns: Array<IColumn>, queryString = '', cb): Promise<void> {
      const { fetchApi, params = {}, datakey = '' } = request;
      if (!fetchApi) {
        return warn('Form', '[SEARCH_HELPER] 类型的 `fetchApi` 参数不正确');
      }
      const res = await fetchApi({ ...{ [fieldName]: queryString }, ...params });
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        cb(this.createSerachHelperList(dataList, columns));
      }
    },
    // 创建搜索帮助数据列表
    createSerachHelperList(list, columns: Array<IColumn>): Record<string, unknown>[] {
      const res = list.map((x) => {
        const item: Record<string, unknown> = {};
        columns.forEach((k) => {
          item[k.dataIndex] = x[k.dataIndex];
        });
        return item;
      });
      return res.length ? [{ __isThead__: !0 }, ...res] : res;
    },
  },
  render(): JSXNode {
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
    const { columns = [], fieldAliasMap, onlySelect = !0 } = options;
    if (!isFunction(fieldAliasMap)) {
      warn('Form', '[SEARCH_HELPER] 类型的 `fieldAliasMap` 参数不正确');
    }
    this.$$form.setViewValue(fieldName, form[fieldName]);
    const prefixCls = getPrefixCls('search-helper');
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
        <el-autocomplete
          v-model={form[fieldName]}
          popper-class={`${prefixCls}__popper`}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          onSelect={(val): void => {
            const alias: Record<string, string> = fieldAliasMap();
            for (let key in alias) {
              form[key] = val[alias[key]];
            }
            if (onlySelect) {
              this[`__${fieldName}__pv`] = form[fieldName];
            }
          }}
          onBlur={(ev): void => {
            if (!onlySelect) return;
            if (ev.target.value) {
              form[fieldName] = this[`__${fieldName}__pv`];
            } else {
              this[`__${fieldName}__pv`] = '';
            }
            setTimeout(() => this[`__${fieldName}__cb`]?.([]), 300);
          }}
          onChange={onChange}
          fetchSuggestions={(queryString, cb): void => {
            !this[`__${fieldName}__cb`] && (this[`__${fieldName}__cb`] = cb);
            this.querySearchAsync(request, fieldName, columns, queryString, cb);
          }}
          v-slots={{
            // 作用域插槽
            default: ({ item }): Array<JSXNode> => {
              return item.__isThead__
                ? columns.map((x) => (
                    // @ts-ignore
                    <th key={x.dataIndex} width={x.width} style="pointer-events: none;">
                      <span>{x.title}</span>
                    </th>
                  ))
                : columns.map((x) => (
                    <td key={x.dataIndex}>
                      <span>{item[x.dataIndex]}</span>
                    </td>
                  ));
            },
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
