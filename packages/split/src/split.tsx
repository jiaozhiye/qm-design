/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-05 12:30:53
 */
import { defineComponent, PropType } from 'vue';
import { JSXNode } from '../../_utils/types';

import { isNumber } from 'lodash-es';
import { isValidWidthUnit } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import { getValidSlot } from '../../_utils/instance-children';

import ResizeBar from './resize-bar';

const SPLIT_PANE_NAME = 'QmSplitPane';

export default defineComponent({
  name: 'QmSplit',
  componentName: 'QmSplit',
  provide() {
    return {
      $$split: this,
    };
  },
  emits: ['change'],
  props: {
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal',
      validator: (val: string): boolean => {
        return ['horizontal', 'vertical'].includes(val);
      },
    },
    initialValue: {
      type: [Number, String] as PropType<number | string>,
      default: '50%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
  },
  data() {
    return {
      isDragging: false,
      offset: this.initialValue,
    };
  },
  methods: {
    dragHandle(val: number): void {
      this.offset = val;
      this.$emit('change');
    },
  },
  render(): JSXNode {
    const { direction, offset } = this;
    const prefixCls = getPrefixCls('split');
    const [FirstComponent, LastComponent] = getValidSlot(this.$slots.default?.(), SPLIT_PANE_NAME) as any[];
    const cls = {
      [prefixCls]: true,
      vertical: direction === 'vertical',
    };
    return (
      <div ref="split" class={cls}>
        <FirstComponent offset={offset} />
        <ResizeBar v-model={[this.isDragging, 'dragging']} direction={direction} onDrag={this.dragHandle} />
        <LastComponent />
      </div>
    );
  },
});
