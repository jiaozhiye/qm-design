/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-13 14:30:10
 */
import { defineComponent } from 'vue';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';
import { IDict } from './types';

import { get } from 'lodash-es';
import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';
import pinyin, { STYLE_FIRST_LETTER } from '../../pinyin';

export default defineComponent({
  name: 'FormSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option', 'multiple'],
  data() {
    return {
      itemList: [],
      originItemList: [], // 原始数据
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
    ['option.options.itemList']: {
      handler(next: Array<IDict>): void {
        if (this.isFetch) return;
        this.itemList = next ?? [];
        this.originItemList = [...this.itemList];
      },
      immediate: true,
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
    filterMethodHandle(queryString = '', isPyt: boolean): Array<IDict> {
      const res: IDict[] = this.originItemList.filter(this.createSearchHelpFilter(queryString, isPyt));
      // 动态改变列表项
      this.itemList = res;
      return res;
    },
    createSearchHelpFilter(queryString: string, isPyt = true): Function {
      return (state) => {
        const pyt: string = pinyin(state.text, { style: STYLE_FIRST_LETTER }).flat().join('');
        const str: string = isPyt ? `${state.text}|${pyt}` : state.text;
        return str.toLowerCase().includes(queryString.toLowerCase());
      };
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = dataList.map((x) => ({ value: x[valueKey], text: x[textKey] }));
        this.originItemList = [...this.itemList];
      }
    },
  },
  render(): JSXNode {
    const { multiple } = this;
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
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { filterable = !0, showTags = !1, openPyt = !0, limit } = options;

    const textVal: string = this.createViewText(form[fieldName]);
    this.$$form.setViewValue(fieldName, textVal);

    const wrapProps = {
      modelValue: this.itemList.length ? form[fieldName] : undefined,
      'onUpdate:modelValue': (val: string): void => {
        form[fieldName] = val;
      },
    };

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
          onChange={(val: string): void => {
            onChange(val, this.createViewText(val));
            if (!filterable) return;
            this.filterMethodHandle('');
          }}
          filterMethod={(queryString: string): void => {
            if (!filterable) return;
            const res: Array<IDict> = this.filterMethodHandle(queryString, openPyt);
            // 精确匹配，直接赋值
            if (!multiple && res.length === 1) {
              form[fieldName] = res[0].value;
              // 触发 change 事件
              onChange(form[fieldName], res[0].text);
              this.filterMethodHandle('');
              // 失去焦点，自动带值
              this.$nextTick(() => this.$refs[type].blur());
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
