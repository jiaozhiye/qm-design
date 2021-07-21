/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-04 15:53:49
 */
import { defineComponent, CSSProperties } from 'vue';
import { get } from 'lodash-es';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import { t } from '../../locale';
import { IDictDeep } from './types';
import { noop, deepFind, deepMapList } from './utils';
import { getPrefixCls } from '../../_utils/prefix';
import { getParserWidth } from '../../_utils/util';
import ClickOutside from '../../directives/click-outside';

export default defineComponent({
  name: 'FormTreeSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option', 'multiple'],
  data() {
    Object.assign(this, { isLoaded: false });
    return {
      filterText: '',
      itemList: [],
      visible: false,
      width: '200px',
    };
  },
  computed: {
    isFetch(): boolean {
      return !!this.option.request?.fetchApi;
    },
    fetchParams(): Nullable<AnyObject<unknown>> {
      return this.isFetch ? this.option.request.params ?? {} : null;
    },
    formItemValue(): string | string[] {
      const { fieldName } = this.option;
      return this.$$form.form[fieldName];
    },
  },
  watch: {
    visible(next: boolean): void {
      if (next) {
        this.isLoaded = next;
      }
    },
    fetchParams(): void {
      this.getItemList();
    },
    formItemValue(next: string | string[]): void {
      this.$refs[`tree`]?.setCheckedKeys(Array.isArray(next) ? next : [next]);
    },
  },
  created() {
    this.isFetch && this.getItemList();
  },
  methods: {
    treeFilterTextHandle(input: string): void {
      this.$refs[`tree`].filter(input);
    },
    getItemText(val: string): string {
      return deepFind<IDictDeep>(this.itemList, val)?.text || '';
    },
    async getItemList(): Promise<void> {
      const { fetchApi, params = {}, datakey = '', valueKey = 'value', textKey = 'text' } = this.option.request;
      const res = await fetchApi(params);
      if (res.code === 200) {
        const dataList = !datakey ? res.data : get(res.data, datakey, []);
        this.itemList = deepMapList<IDictDeep>(dataList, valueKey, textKey);
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
    const { isFetch, multiple, width } = this;
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
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    const innerStyle: CSSProperties = {
      minWidth: '195px',
      maxHeight: '300px',
      marginLeft: '-12px',
      marginRight: '-12px',
      paddingLeft: '10px',
      paddingRight: '10px',
      overflowY: 'auto',
    };
    const prefixCls = getPrefixCls('tree-select');
    // select 组件的值
    const labels: string | string[] = !multiple ? this.getItemText(form[fieldName]) : form[fieldName].map((val) => this.getItemText(val));
    const textVal: string = !multiple ? (labels as string) : (labels as string[]).join(',');
    this.$$form.setViewValue(fieldName, textVal);
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
        <div class="tree-select">
          <el-popover
            ref="popper"
            popper-class={`${prefixCls}__popper`}
            v-model={[this.visible, 'visible']}
            width={width}
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
            fallback-placements={['auto']}
            append-to-body={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            onAfterLeave={(): void => {
              this.filterText = '';
              this.treeFilterTextHandle(this.filterText);
            }}
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
                  v-click-outside={($down, $up): void => {
                    if (document.getElementById(this.$refs[`popper`].popperId)?.contains($up)) return;
                    this.visible = !1;
                  }}
                  onVisibleChange={(visible: boolean): void => {
                    if (!visible) return;
                    this.width = this.$refs[`select`].$el.getBoundingClientRect().width + 'px';
                  }}
                  onRemoveTag={(tag) => {
                    if (!multiple) return;
                    const val: string = this.deepFindValue(this.itemList, tag).value;
                    form[fieldName] = form[fieldName].filter((x) => x !== val);
                    onChange(form[fieldName], null);
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
            <div style={{ ...innerStyle, ...style }}>
              {this.isLoaded && (
                <>
                  <el-input
                    v-model={this.filterText}
                    placeholder={t('qm.form.treePlaceholder')}
                    onInput={(val: string): void => {
                      this.treeFilterTextHandle(val);
                    }}
                  />
                  <el-tree
                    ref="tree"
                    class="tree-select__tree"
                    data={this.itemList}
                    nodeKey={'value'}
                    props={{ children: 'children', label: 'text' }}
                    defaultCheckedKeys={multiple ? form[fieldName] : undefined}
                    style={{ marginTop: '5px' }}
                    checkStrictly={true}
                    defaultExpandAll={true}
                    expandOnClickNode={false}
                    showCheckbox={multiple}
                    checkOnClickNode={multiple}
                    // 节点过滤，配合输入框筛选使用
                    filterNodeMethod={(val, data): boolean => {
                      if (!val) return true;
                      return data.text.indexOf(val) !== -1;
                    }}
                    onNodeClick={(item): void => {
                      if (multiple || item.disabled) return;
                      form[fieldName] = item.value;
                      this.visible = false;
                      onChange(form[fieldName], item);
                    }}
                    onCheck={(data, item): void => {
                      if (!multiple) return;
                      form[fieldName] = item.checkedKeys;
                      onChange(form[fieldName], item);
                    }}
                  />
                </>
              )}
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
