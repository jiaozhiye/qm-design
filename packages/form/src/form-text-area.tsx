/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 12:31:42
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormTextArea',
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
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      rows = 2,
      maxrows,
      maxlength = 200,
      onInput = noop,
      onClick = noop,
      onDblClick = noop,
    } = options;
    this.$$form.setViewValue(fieldName, form[fieldName]);
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
        <el-input
          type="textarea"
          v-model={form[fieldName]}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          autosize={{ minRows: rows, maxRows: maxrows }}
          maxlength={maxlength}
          show-word-limit
          onClick={(): void => {
            onClick(form[fieldName]);
          }}
          onDblclick={(): void => {
            onDblClick(form[fieldName]);
          }}
          onInput={(val: string): void => {
            onInput(val);
          }}
          onChange={(val: string): void => {
            form[fieldName] = val.trim();
            onChange(form[fieldName]);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
