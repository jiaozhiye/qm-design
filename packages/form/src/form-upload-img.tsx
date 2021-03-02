/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-02 15:35:32
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

import UploadCropper from '../../upload-cropper';

export default defineComponent({
  name: 'FormUploadImg',
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
      upload = {},
      style = {},
      disabled,
      onChange = noop,
    } = this.option;

    this.$$form.setViewValue(fieldName, '');

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
        <UploadCropper
          // @ts-ignore
          actionUrl={upload.actionUrl}
          headers={upload.headers}
          initialValue={form[fieldName]}
          style={{ ...style }}
          fixedSize={upload.fixedSize}
          isCalcHeight={upload.isCalcHeight}
          fileSize={upload.fileSize}
          limit={upload.limit || 1}
          params={upload.params}
          titles={upload.titles}
          disabled={disabled}
          onChange={(val): void => {
            form[fieldName] = val;
            this.$$form.formItemValidate(fieldName);
            onChange(val);
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
