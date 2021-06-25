/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-19 09:16:37
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormRangeInput',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const { label, fieldName, labelWidth, labelOptions, descOptions, clearable = !0, readonly, disabled, onChange = noop } = this.option;
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth && getParserWidth(labelWidth)}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <div>
          <el-input
            v-model={form[fieldName][0]}
            placeholder={!disabled ? t('qm.form.rangeInputNumberPlaceholder.0') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={() => onChange(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-input
            v-model={form[fieldName][1]}
            placeholder={!disabled ? t('qm.form.rangeInputNumberPlaceholder.1') : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={() => onChange(form[fieldName])}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
