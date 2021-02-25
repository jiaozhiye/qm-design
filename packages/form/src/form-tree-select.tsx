/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 20:04:20
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop, deepFind } from './utils';
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
      visible: false,
    };
  },
  methods: {
    // 输入框筛选，调用树组件 filter 方法
    treeFilterTextHandle(input: string): void {
      this.$refs[`tree`]?.filter(input);
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
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { itemList } = options;
    const innerStyle = {
      minWidth: '195px',
      maxHeight: '300px',
      marginLeft: '-12px',
      marginRight: '-12px',
      paddingLeft: '10px',
      paddingRight: '10px',
      overflowY: 'auto',
    };
    const selectText: string = deepFind(itemList, form[fieldName])?.text || '';
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
            popper-class={`popover-${fieldName}`}
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
                  popper-class="select-option"
                  modelValue={selectText}
                  placeholder={placeholder}
                  clearable={clearable}
                  disabled={disabled}
                  readonly={readonly}
                  style={readonly && { pointerEvents: 'none' }}
                  popper-append-to-body={false}
                  // v-click-outside={() => (this.visible = !1)}
                  v-click-outside={{
                    callback: () => (this.visible = !1),
                    excludes: [document.querySelector(`.popover-${fieldName}`)],
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
                style={{ maxWidth: '175px' }}
                onInput={(val: string): void => {
                  this.treeFilterTextHandle(val);
                }}
              />
              <el-tree
                ref="tree"
                data={itemList}
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
