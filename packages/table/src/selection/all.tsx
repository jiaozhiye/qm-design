/*
 * @Author: 焦质晔
 * @Date: 2020-03-06 21:30:12
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 09:57:20
 */
import { defineComponent } from 'vue';
import { intersection, xor } from 'lodash-es';
import Checkbox from '../checkbox';
import { getAllRowKeys } from '../utils';
import { noop } from '../../../_utils/util';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'AllSelection',
  props: ['selectionKeys'],
  inject: ['$$table'],
  computed: {
    filterAllRowKeys() {
      const { tableFullData, getRowKey, rowSelection } = this.$$table;
      const { disabled = noop } = rowSelection;
      return getAllRowKeys(tableFullData, getRowKey, disabled);
    },
    indeterminate() {
      return this.selectionKeys.length > 0 && intersection(this.selectionKeys, this.filterAllRowKeys).length < this.filterAllRowKeys.length;
    },
    selectable() {
      return !this.indeterminate && this.selectionKeys.length > 0;
    },
  },
  methods: {
    changeHandle(val) {
      const { selectionKeys, filterAllRowKeys } = this;
      this.$$table.selectionKeys = val ? [...new Set([...selectionKeys, ...filterAllRowKeys])] : xor(selectionKeys, filterAllRowKeys);
    },
  },
  render(): JSXNode {
    return <Checkbox indeterminate={this.indeterminate} modelValue={this.selectable} onChange={this.changeHandle} />;
  },
});
