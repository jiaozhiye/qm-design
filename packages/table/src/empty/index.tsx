/*
 * @Author: 焦质晔
 * @Date: 2020-03-08 14:47:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 15:42:32
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';
import { getPrefixCls } from '../../../_utils/prefix';
import EmptyEle from './element';

export default defineComponent({
  name: 'EmptyContent',
  inject: ['$$table'],
  computed: {
    styles() {
      const { layout } = this.$$table;
      return {
        top: `${layout.headerHeight}px`,
        height: `${layout.viewportHeight}px`,
      };
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}--empty`} style={this.styles}>
        <div class="content">
          <EmptyEle />
        </div>
      </div>
    );
  },
});
