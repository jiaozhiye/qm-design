/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-16 19:40:05
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { getParserWidth, isEmpty, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';
import { JSXNode, AnyObject, Nullable } from '../../_utils/types';

import { IDict, IDictDeep } from './types';
import { deepFind, deepMapList } from './utils';
import ClickOutside from '../../directives/click-outside';

import Tabs from '../../tabs';
import TabPane from '../../tab-pane';

export default defineComponent({
  name: 'FormRegionSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option'],
  data() {
    Object.assign(this, { prevText: '' });
    return {
      itemList: [], // 省市区，不包含街道
      values: [],
      tabs: [], // 二维数组
      activeName: '0',
      visible: false,
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    isFetchStreet(): boolean {
      return !!this.option.request?.fetchStreetApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
    leaves(): number {
      return !this.isFetchStreet ? 3 : 4;
    },
    formItemValue(): string {
      const { fieldName } = this.option;
      return this.$$form.form[fieldName];
    },
  },
  watch: {
    fetchParams(): void {
      this.getItemList();
    },
    itemList(next: Array<IDictDeep>): void {
      this.tabs[0] = next.map((x) => ({ text: x.text, value: x.value })) as IDict[];
      this.isFetch && this.createTabs();
    },
    formItemValue(next: string): void {
      if (this.values.join(',') === next) return;
      this.initial();
    },
  },
  created() {
    if (this.isFetch) {
      this.getItemList();
    } else {
      this.itemList = this.option.options?.itemList ?? [];
    }
    this.initial();
  },
  methods: {
    initial(): void {
      const { form } = this.$$form;
      const { fieldName } = this.option;
      this.values = (form[fieldName] ? form[fieldName].split(',') : []) as string[];
      this.createTabs();
      this.createActiveName(this.values.length ? this.values.length - 1 : 0);
    },
    setFormItemValue(): void {
      const { form } = this.$$form;
      const { fieldName } = this.option;
      form[fieldName] = this.values.join(',');
      // 关闭 popper
      this.visible = !1;
    },
    createActiveName(index: number): void {
      this.activeName = index.toString();
    },
    createTextValue(val: string): string {
      const values: string[] = val ? val.split(',') : [];
      return values.map((x, i) => this.tabs[i]?.find((k) => k.value === x)?.text).join('/');
    },
    createTabs(): void {
      if (!this.itemList.length) return;
      this.tabs = this.tabs.slice(0, 1);
      for (let i = 0; i < this.values.length; i++) {
        const target: Nullable<IDictDeep> = deepFind<IDictDeep>(this.itemList, this.values[i]);
        if (target && isEmpty(target.children)) {
          if (this.isFetchStreet) {
            this.getStreetList(this.values[i]);
          }
          break;
        }
        if (Array.isArray(target?.children)) {
          this.tabs[i + 1] = target?.children.map((x) => ({ text: x.text, value: x.value })) as IDict[];
        }
      }
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = deepMapList<IDictDeep>(dataList, valueKey, textKey);
      }
    },
    async getStreetList(code: string): Promise<void> {
      const { fetchStreetApi, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchStreetApi({ code });
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.tabs.push(dataList.map((x) => ({ text: x[textKey], value: x[valueKey] })) as IDict[]);
      }
    },
    renderTabPane(): Array<JSXNode> {
      return this.tabs.map((arr, index) => {
        const label: string = arr.find((x) => x.value === this.values[index])?.text || t('qm.form.selectPlaceholder').replace('...', '');
        return (
          // @ts-ignore
          <TabPane key={index} label={label} name={index.toString()}>
            <div class="region-item">
              {arr.map((x) => (
                <span
                  key={x.value}
                  class={{ [`region-item__item`]: true, actived: this.values.includes(x.value) }}
                  onClick={(): void => {
                    this.values[index] = x.value;
                    this.values = this.values.slice(0, index + 1);
                    if (index >= this.leaves - 1) {
                      return this.setFormItemValue();
                    }
                    this.createTabs();
                    this.createActiveName(index + 1);
                  }}
                >
                  {x.text}
                </span>
              ))}
            </div>
          </TabPane>
        );
      });
    },
  },
  render(): JSXNode {
    const { form } = this.$$form;
    const {
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
    const prefixCls = getPrefixCls('region-select');

    let textValue: string = this.prevText;
    if (!this.visible) {
      let temp: string = this.createTextValue(form[fieldName]);
      if (temp === '' || temp.split('/').every((x) => x !== '')) {
        textValue = temp;
        this.prevText = textValue;
      }
    }

    this.$$form.setViewValue(fieldName, textValue);
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
        <div class="region-select">
          <el-popover
            popper-class={`${prefixCls}__popper region-select__${fieldName}`}
            v-model={[this.visible, 'visible']}
            width="auto"
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
            append-to-body={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            v-slots={{
              reference: (): JSXNode => (
                <el-select
                  ref="select"
                  popper-class="select-option"
                  modelValue={textValue}
                  placeholder={!disabled ? placeholder : ''}
                  clearable={clearable}
                  disabled={disabled}
                  readonly={readonly}
                  style={readonly && { pointerEvents: 'none' }}
                  popper-append-to-body={false}
                  v-click-outside={[() => (this.visible = !1), document.querySelector(`.region-select__${fieldName}`)]}
                  onVisibleChange={(visible: boolean): void => {
                    if (!visible) return;
                    setStyle(
                      document.querySelector(`.region-select__${fieldName}`) as HTMLElement,
                      'minWidth',
                      `${this.$refs[`select`].$el.getBoundingClientRect().width}px`
                    );
                  }}
                  onClick={(): void => {
                    if (!(disabled || readonly)) {
                      this.visible = !this.visible;
                    }
                  }}
                  onClear={(): void => {
                    form[fieldName] = undefined;
                    onChange(form[fieldName], null);
                  }}
                />
              ),
            }}
          >
            <div class="container" style={{ ...style }}>
              {this.visible && <Tabs v-model={[this.activeName, 'modelValue']}>{this.renderTabPane()}</Tabs>}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
