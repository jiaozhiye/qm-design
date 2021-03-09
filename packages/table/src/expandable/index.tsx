/*
 * @Author: 焦质晔
 * @Date: 2020-03-30 15:59:26
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 09:56:52
 */
import { defineComponent } from 'vue';
import { noop } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Expandable',
  props: ['record', 'rowKey'],
  inject: ['$$table'],
  computed: {
    expanded() {
      return this.$$table.rowExpandedKeys.includes(this.rowKey);
    },
  },
  watch: {
    expanded(val) {
      const { onExpand = noop } = this.$$table.expandable || {};
      onExpand(val, this.record);
    },
  },
  methods: {
    clickHandle(ev) {
      ev.stopPropagation();
      const { rowExpandedKeys } = this.$$table;
      // 展开状态 -> 收起
      const result = this.expanded ? rowExpandedKeys.filter((x) => x !== this.rowKey) : [...new Set([...rowExpandedKeys, this.rowKey])];
      this.$$table.rowExpandedKeys = result;
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('expand');
    const cls = {
      [`${prefixCls}--icon`]: true,
      expanded: this.expanded,
      collapsed: !this.expanded,
    };
    return <span class={cls} onClick={this.clickHandle} />;
  },
});