/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-25 20:45:37
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormCheckboxGroup',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
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
      style = {},
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList = [], limit } = options;
    this.$$form.setViewValue(
      fieldName,
      itemList
        .filter((x) => form[fieldName].includes(x.value))
        .map((x) => x.text)
        .join(',')
    );
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
        <el-checkbox-group
          v-model={form[fieldName]}
          max={limit}
          disabled={disabled}
          style={{ ...style }}
          onChange={onChange}
        >
          {itemList.map((x) => {
            return (
              <el-checkbox key={x.value} label={x.value} disabled={x.disabled}>
                {x.text}
              </el-checkbox>
            );
          })}
        </el-checkbox-group>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
