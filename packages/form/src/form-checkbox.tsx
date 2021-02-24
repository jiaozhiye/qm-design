/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 14:45:44
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
    const { trueValue = '1', falseValue = '0' } = options;
    this.$$form.setViewValue(
      fieldName,
      form[fieldName] === trueValue ? t('qm.form.trueText') : t('qm.form.falseText')
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
        <div style={{ display: 'inline-flex', ...style }}>
          <el-checkbox
            v-model={form[fieldName]}
            disabled={disabled}
            trueLabel={trueValue}
            falseLabel={falseValue}
            onChange={onChange}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
