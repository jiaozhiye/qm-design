/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 08:48:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-14 18:56:01
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';
import { getPrefixCls } from '../../_utils/prefix';

import Divider from '../../divider';

export default defineComponent({
  name: 'QmAnchorItem',
  componentName: 'QmAnchorItem',
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
    const { showDivider, label } = this;
    const prefixCls = getPrefixCls('anchor-item');
    const cls = {
      [prefixCls]: true,
    };
    return (
      <div class={cls}>
        {/* @ts-ignore */}
        {showDivider && <Divider label={label} style={{ marginBottom: '10px' }} />}
        {this.$slots.default?.()}
      </div>
    );
  },
});
