/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-04 14:24:23
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormSwitch',
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
        <div style={{ position: 'relative', top: '-1px', ...style }}>
          <el-switch
            v-model={form[fieldName]}
            disabled={disabled}
            activeValue={trueValue}
            inactiveValue={falseValue}
            onChange={onChange}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
