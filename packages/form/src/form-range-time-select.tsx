/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 08:58:59
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormRangeTimeSelect',
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
      placeholder,
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      valueFormat = 'HH:mm',
      startTime = '00:00',
      endTime = '23:45',
      stepTime = '00:15',
      startDisabled,
      endDisabled,
    } = options;
    const [startVal, endVal] = form[fieldName];
    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));
    const startWrapProps = {
      modelValue: form[fieldName][0],
      'update:modelValue': (val): void => {
        form[fieldName] = [val ?? undefined, form[fieldName][1]];
      },
    };
    const endWrapProps = {
      modelValue: form[fieldName][1],
      'update:modelValue': (val): void => {
        form[fieldName] = [form[fieldName][0], val ?? undefined];
      },
    };
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
          <el-time-select
            {...startWrapProps}
            pickerOptions={{
              start: startTime,
              end: endTime,
              step: stepTime,
              maxTime: endVal,
            }}
            value-format={valueFormat}
            placeholder={!disabled ? t('qm.form.timerangePlaceholder')[0] : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled || startDisabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(): void => onChange(form[fieldName])}
          />
          <span style="display: inline-block; text-align: center; width: 14px;">-</span>
          <el-time-select
            {...endWrapProps}
            pickerOptions={{
              start: startTime,
              end: endTime,
              step: stepTime,
              minTime: startVal,
            }}
            value-format={valueFormat}
            placeholder={!disabled ? t('qm.form.timerangePlaceholder')[1] : ''}
            clearable={clearable}
            readonly={readonly}
            disabled={disabled || endDisabled}
            style={{ width: `calc(50% - 7px)` }}
            onChange={(): void => onChange(form[fieldName])}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
