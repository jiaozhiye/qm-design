/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 21:30:12
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 15:15:41
 */
import { defineComponent } from 'vue';
import { intersection, xor } from 'lodash-es';
import { getAllRowKeys } from '../utils';
import { noop } from '../../../_utils/util';
import { JSXNode } from '../../../_utils/types';

import Checkbox from '../checkbox';

export default defineComponent({
  name: 'AllSelection',
  props: ['selectionKeys'],
  inject: ['$$table'],
  computed: {
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
  },
  render(): JSXNode {
    return <Checkbox indeterminate={this.indeterminate} modelValue={this.selectable} onChange={this.changeHandle} />;
  },
});
