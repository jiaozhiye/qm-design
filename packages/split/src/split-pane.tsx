/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 08:48:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-05 12:25:54
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';

export default defineComponent({
  name: 'QmSplitPane',
  componentName: 'QmSplitPane',
  inject: ['$$split'],
  props: ['offset'],
  render(): JSXNode {
    const { direction, isDragging } = this.$$split;
    const prefixCls = getPrefixCls('split-pane');
    const property = direction === 'vertical' ? 'height' : 'width';
    const cls = {
      [prefixCls]: true,
      isLocked: isDragging,
      horizontal: direction === 'horizontal',
      vertical: direction === 'vertical',
    };
    const styles = this.offset ? { [property]: getParserWidth(this.offset) } : { flex: 1 };
    return (
      <div class={cls} style={{ ...styles }}>
        {this.$slots.default?.()}
      </div>
    );
  },
});
