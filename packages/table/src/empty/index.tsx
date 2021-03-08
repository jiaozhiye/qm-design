/*
 * @Author: 焦质晔
 * @Date: 2020-03-08 14:47:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 13:40:45
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';
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
    return (
      <div class="v-table--empty-placeholder" style={this.styles}>
        <div class="v-table--empty-content">
          <EmptyEle />
        </div>
      </div>
    );
  },
});
