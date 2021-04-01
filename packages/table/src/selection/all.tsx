/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 21:30:12
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-04-01 12:56:33
 */
import { defineComponent } from 'vue';
import { intersection, xor } from 'lodash-es';
import { getAllRowKeys } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

import Checkbox from '../checkbox';
import DropdownIcon from '../icon/dropdown';

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
      return rowSelection.filterable || false;
    },
    filterAllRowKeys(): string[] {
      const { tableFullData, getRowKey, rowSelection } = this.$$table;
      const { disabled = noop } = rowSelection;
      return getAllRowKeys(tableFullData, getRowKey, disabled);
    },
    indeterminate(): boolean {
      return this.selectionKeys.length > 0 && intersection(this.selectionKeys, this.filterAllRowKeys).length < this.filterAllRowKeys.length;
    },
    selectable(): boolean {
      return !this.indeterminate && this.selectionKeys.length > 0;
    },
  },
  methods: {
    changeHandle(val: boolean): void {
      const { selectionKeys, filterAllRowKeys } = this;
      this.$$table.selectionKeys = val ? [...new Set([...selectionKeys, ...filterAllRowKeys])] : xor(selectionKeys, filterAllRowKeys);
    },
    selectAllHandle(): void {
      this.changeHandle(true);
    },
    invertHandle(): void {
      this.changeHandle(false);
    },
    clearAllHandle(): void {
      this.$$table.selectionKeys = this.selectionKeys.filter((x) => !this.filterAllRowKeys.includes(x));
    },
  },
  render(): JSXNode {
    const { isFilterable } = this;
    const prefixCls = getPrefixCls('table');
    return (
      <div class="cell--selection">
        <Checkbox indeterminate={this.indeterminate} modelValue={this.selectable} onChange={this.changeHandle} />
        {isFilterable && (
          <el-popover
            popper-class={`${prefixCls}__popper is-pure`}
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
            <div>
              <ul class="el-dropdown-menu--small">
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
            </div>
          </el-popover>
        )}
      </div>
    );
  },
});
