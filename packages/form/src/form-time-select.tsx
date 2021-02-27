/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 08:51:31
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormTimeSelect',
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
      placeholder = t('qm.form.timePlaceholder'),
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      valueFormat = 'HH:mm',
      defaultTime,
      startTime = '00:00',
      endTime = '23:45',
      stepTime = '00:15',
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
        <el-time-select
          v-model={form[fieldName]}
          pickerOptions={{
            start: startTime,
            end: endTime,
            step: stepTime,
          }}
          default-value={defaultTime ? defaultTime.slice(0, 5) : defaultTime}
          value-format={valueFormat}
          placeholder={!disabled ? placeholder : ''}
          style={{ ...style }}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          onChange={onChange}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
