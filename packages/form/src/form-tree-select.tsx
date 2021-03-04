/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-04 11:19:01
 */
import { defineComponent } from 'vue';
import { AnyObject, JSXNode, Nullable } from '../../_utils/types';

import { get } from 'lodash-es';
import { t } from '../../locale';
import { IDict } from './types';
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
    return {
      filterText: '',
      itemList: [],
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
    // 输入框筛选，调用树组件 filter 方法
    treeFilterTextHandle(input: string): void {
      this.$refs[`tree`]?.filter(input);
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
        this.itemList = deepMapList(dataList, valueKey, textKey);
      }
    },
  },
  render(): JSXNode {
    const { isFetch } = this;
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
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList } = options;
    if (!isFetch) {
      this.itemList = itemList ?? [];
    }
    const innerStyle = {
      minWidth: '195px',
      maxHeight: '300px',
      marginLeft: '-12px',
      marginRight: '-12px',
      paddingLeft: '10px',
      paddingRight: '10px',
      overflowY: 'auto',
    };
    const prefixCls = getPrefixCls('tree-select');
    const selectText: string = deepFind<IDict>(this.itemList, form[fieldName])?.text || '';
    this.$$form.setViewValue(fieldName, selectText);
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
        <div class="tree-select">
          <el-popover
            popper-class={`${prefixCls}__popper tree-select__${fieldName}`}
            v-model={[this.visible, 'visible']}
            width={'auto'}
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
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
                  modelValue={selectText}
                  placeholder={!disabled ? placeholder : ''}
                  clearable={clearable}
                  disabled={disabled}
                  readonly={readonly}
                  style={readonly && { pointerEvents: 'none' }}
                  popper-append-to-body={false}
                  // v-click-outside={() => (this.visible = !1)}
                  v-click-outside={[
                    () => (this.visible = !1),
                    document.querySelector(`.tree-select__${fieldName}`),
                  ]}
                  onVisibleChange={(visible: boolean): void => {
                    if (!visible) return;
                    const $treeSelectPopper: HTMLElement = document.querySelector(
                      `.tree-select__${fieldName}`
                    );
                    const width: number = this.$refs[`select`].$el.getBoundingClientRect().width;
                    this.$nextTick(() => {
                      $treeSelectPopper.style.width = width + 'px';
                    });
                  }}
                  onClick={(): void => {
                    if (!(disabled || readonly)) {
                      this.visible = !this.visible;
                    }
                  }}
                  onClear={() => {
                    form[fieldName] = undefined;
                    onChange(form[fieldName], null);
                  }}
                />
              ),
            }}
          >
            <div style={{ ...innerStyle, ...style }}>
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
                props={{ children: 'children', label: 'text' }}
                style={{ marginTop: '5px' }}
                defaultExpandAll={true}
                expandOnClickNode={false}
                // 节点过滤，配合输入框筛选使用
                filterNodeMethod={(val, data): boolean => {
                  if (!val) return true;
                  return data.text.indexOf(val) !== -1;
                }}
                onNodeClick={(item): void => {
                  if (item.disabled) return;
                  form[fieldName] = item.value;
                  this.visible = false;
                  onChange(form[fieldName], item);
                }}
              />
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
