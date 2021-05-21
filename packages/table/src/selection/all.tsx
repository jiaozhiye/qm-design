/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 21:30:12
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-21 13:51:23
 */
import { defineComponent } from 'vue';
import { intersection, union, xor } from 'lodash-es';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

import Checkbox from '../checkbox';
import DropdownIcon from '../icon/dropdown';

// intersection -> 交集(去重)
// union -> 并集(去重)
// xor -> 补集(并集 + 除了交集)

export default defineComponent({
  name: 'AllSelection',
  props: ['selectionKeys'],
  inject: ['$$table'],
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    isFilterable(): boolean {
      const { rowSelection } = this.$$table;
      return rowSelection.filterable || !1;
    },
    filterAllRowKeys(): string[] {
      const { allTableData, getRowKey, rowSelection } = this.$$table;
      const { disabled = noop } = rowSelection;
      return allTableData.filter((row) => !disabled(row)).map((row) => getRowKey(row, row.index));
    },
    indeterminate(): boolean {
      return this.selectionKeys.length > 0 && intersection(this.selectionKeys, this.filterAllRowKeys).length < this.filterAllRowKeys.length;
    },
    selectable(): boolean {
      return !this.indeterminate && this.selectionKeys.length > 0;
    },
    size(): string {
      return this.$$table.tableSize !== 'mini' ? 'small' : 'mini';
    },
  },
  methods: {
    changeHandle(val: boolean): void {
      const { selectionKeys, filterAllRowKeys } = this;
      this.$$table.selectionKeys = val ? union(selectionKeys, filterAllRowKeys) : selectionKeys.filter((x) => !filterAllRowKeys.includes(x));
    },
    selectAllHandle(): void {
      this.changeHandle(true);
    },
    invertHandle(): void {
      this.$$table.selectionKeys = xor(this.selectionKeys, this.filterAllRowKeys);
    },
    clearAllHandle(): void {
      this.changeHandle(false);
    },
  },
  render(): JSXNode {
    const { isFilterable, size } = this;
    const prefixCls = getPrefixCls('table');
    return (
      <div class="cell--selection">
        <Checkbox
          indeterminate={this.indeterminate}
          disabled={!this.filterAllRowKeys.length}
          modelValue={this.selectable}
          onChange={this.changeHandle}
        />
        {isFilterable && (
          <el-popover
            popper-class={`${prefixCls}__popper head-selection--popper`}
            v-model={[this.visible, 'visible']}
            width="auto"
            trigger="click"
            placement="bottom-start"
            transition="el-zoom-in-top"
            offset={4}
            show-arrow={false}
            append-to-body={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            v-slots={{
              reference: (): JSXNode => (
                <span class="extra icon-svg">
                  <DropdownIcon />
                </span>
              ),
            }}
          >
            <ul class={`el-dropdown-menu--${size}`}>
              <li class="el-dropdown-menu__item" onClick={() => this.selectAllHandle()}>
                {t('qm.table.selection.all')}
              </li>
              <li class="el-dropdown-menu__item" onClick={() => this.invertHandle()}>
                {t('qm.table.selection.invert')}
              </li>
              <li class="el-dropdown-menu__item" onClick={() => this.clearAllHandle()}>
                {t('qm.table.selection.clear')}
              </li>
            </ul>
          </el-popover>
        )}
      </div>
    );
  },
});
