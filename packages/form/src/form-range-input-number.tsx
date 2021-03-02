/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-02 15:53:20
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

import InputNumber from './InputNumber';

export default defineComponent({
  name: 'FormRangeInputNumber',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { form } = this.$$form;
    const {
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { min = 0, max, step = 1, precision } = options;
    const [startVal = min, endVal = max] = form[fieldName];
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
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
        <div>
          <InputNumber
            v-model={form[fieldName][0]}
            min={min}
            max={endVal}
            step={step}
            precision={precision}
            controls={false}
            placeholder={!disabled ? t('qm.form.rangeInputNumberPlaceholder')[0] : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={() => onChange(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <InputNumber
            v-model={form[fieldName][1]}
            min={startVal}
            max={max}
            step={step}
            precision={precision}
            controls={false}
            placeholder={!disabled ? t('qm.form.rangeInputNumberPlaceholder')[1] : ''}
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
