/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-28 08:14:22
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormInput',
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
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      minlength = 0,
      maxlength,
      showLimit,
      password = false,
      noInput,
      toUpper,
      unitRender,
      onInput = noop,
      onEnter = noop,
      onFocus = noop,
      onBlur = noop,
      onClick = noop,
      onDblClick = noop,
    } = options;
    const isSearchHelper: boolean = !!Object.keys(searchHelper).length;
    this.$$form.setViewValue(fieldName, form[fieldName]);

    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val: string): void => {
        // 搜索帮助，不允许输入
        if (noInput) return;
        form[fieldName] = !toUpper ? val : val.toUpperCase();
        onInput(val);
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
        <el-input
          ref={type}
          {...wrapProps}
          title={form[fieldName]}
          minlength={minlength}
          maxlength={maxlength}
          placeholder={
            !disabled ? (!isSearchHelper ? placeholder : t('qm.form.selectPlaceholder')) : ''
          }
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          show-password={password}
          show-word-limit={showLimit}
          onChange={() => {}}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
