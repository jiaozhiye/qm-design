/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 19:32:14
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { getParserWidth, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';
import { JSXNode, AnyObject, Nullable } from '../../_utils/types';

import { IDictDeep } from './types';
import { deepFind, deepMapList } from './utils';
import ClickOutside from '../../directives/click-outside';

import Tabs from '../../tabs';
import TabPane from '../../tab-pane';

export default defineComponent({
  name: 'FormRegionSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option', 'multiple'],
  data() {
    return {
      itemList: [], // 省市区，不包含街道
      streets: [], // 街道
      activeName: 'first',
      visible: false,
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
    getItemText(val: string): string {
      return deepFind<IDictDeep>(this.itemList, val)?.text || '';
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = deepMapList(dataList, valueKey, textKey);
      }
    },
    // 工具方法
    deepFindValue(arr: IDictDeep[], mark: string): Nullable<IDictDeep> {
      let res = null;
      for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i].children)) {
          res = this.deepFindValue(arr[i].children, mark);
        }
        if (res) {
          return res;
        }
        if (arr[i].text === mark) {
          return arr[i];
        }
      }
      return res;
    },
  },
  render(): JSXNode {
    const { isFetch, multiple } = this;
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
    const { itemList } = options;

    if (!isFetch) {
      this.itemList = itemList ?? [];
    }

    const labels: string | string[] = !multiple ? this.getItemText(form[fieldName]) : form[fieldName].map((val) => this.getItemText(val));
    const textVal: string = !multiple ? (labels as string) : (labels as string[]).join(',');
    this.$$form.setViewValue(fieldName, textVal);

    const prefixCls = getPrefixCls('region-select');

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
                  modelValue={labels}
                  multiple={multiple}
                  title={multiple ? textVal : null}
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
                      document.querySelector(`.region-select__${fieldName}`),
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
                    form[fieldName] = !multiple ? undefined : [];
                    onChange(form[fieldName], null);
                  }}
                />
              ),
            }}
          >
            <div class="container" style={{ ...style }}>
              {this.visible && (
                <Tabs v-model={[this.activeName, 'modelValue']}>
                  <TabPane label="用户管理" name="first">
                    用户管理
                  </TabPane>
                  <TabPane label="配置管理" name="second">
                    配置管理
                  </TabPane>
                </Tabs>
              )}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
