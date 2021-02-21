/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 08:48:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 14:35:38
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { getPrefixCls } from '../../_utils/prefix';

export default defineComponent({
  name: 'QmAnchorItem',
  componentName: 'QmAnchorItem',
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      required: true,
    },
    showDivider: {
      type: Boolean,
      default: false,
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('anchor-item');
    const cls = {
      [prefixCls]: true,
    };
    return <div class={cls}>{this.$slots.default?.()}</div>;
  },
});
