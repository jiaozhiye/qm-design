/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 20:04:20
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

import InputNumber from './InputNumber';

export default defineComponent({
  name: 'FormInputNumber',
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
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { maxlength, min = 0, max, step, precision, controls = !1, onEnter = noop } = options;
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
        <InputNumber
          ref={type}
          v-model={form[fieldName]}
          min={min}
          max={max}
          step={step}
          precision={precision}
          maxlength={maxlength}
          controls={controls}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          onChange={onChange}
          onKeydown={(ev: KeyboardEvent) => {
            if (ev.keyCode !== 13) return;
            setTimeout(() => {
              onEnter(form[fieldName] ?? '');
              this.$$form.formItemValidate(fieldName);
            });
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
