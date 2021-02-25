/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-25 20:11:49
 */
import { defineComponent } from 'vue';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import { get } from 'lodash-es';
import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

export default defineComponent({
  name: 'FormSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    return {
      itemList: [],
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
  },
  watch: {
    fetchParams(): void {
      this.getItemList();
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    createViewText(val: string | string[]): string {
      return !this.multiple
        ? this.itemList.find((x) => x.value === val)?.text
        : this.itemList
            .filter((x) => (val as string[])?.includes(x.value))
            .map((x) => x.text)
            .join(',');
    },
    async getItemList(): Promise<void> {
      const {
        fetchApi,
        params = {},
        datakey = '',
        valueKey = 'value',
        textKey = 'text',
      } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
      }
    },
  },
  render(): JSXNode {
    const { multiple, isFetch } = this;
    const { form } = this.$$form;
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      request = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      clearable = !0,
      showTags,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList, filterable = !0, openPyt = !0, limit } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    const textVal = this.createViewText(form[fieldName]);
    this.$$form.setViewValue(fieldName, textVal);
    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val: string): void => {
        if (!(multiple && filterable)) {
          form[fieldName] = val;
        } else {
          setTimeout(() => (form[fieldName] = val), 20);
        }
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
        <el-select
          ref={type}
          {...wrapProps}
          multiple={multiple}
          multipleLimit={limit}
          collapseTags={!showTags && multiple}
          filterable={filterable}
          title={multiple ? textVal : null}
          placeholder={!disabled ? placeholder : ''}
          clearable={clearable}
          disabled={disabled}
          style={{ ...style }}
          onVisibleChange={(visible) => {
            if (filterable && !visible) {
              this.$refs[type].blur();
              setTimeout(() => this.filterMethodHandle(fieldName, ''), 300);
            }
          }}
          onChange={(val) => {
            onChange(val, this.createViewText(val));
            if (!filterable) return;
            this.filterMethodHandle(fieldName, '');
          }}
          filterMethod={(queryString) => {
            if (!filterable) return;
            const res = this.filterMethodHandle(fieldName, queryString, openPyt);
            if (!multiple && res.length === 1) {
              this.form[fieldName] = res[0].value;
              this.$refs[type].blur();
              onChange(res[0].value, res[0].text);
            }
          }}
        >
          {this.itemList.map((x) => (
            <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
          ))}
        </el-select>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
