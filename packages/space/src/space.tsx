/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 23:38:46
 */
import { defineComponent } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode } from '../../_utils/types';
import { useSize } from '../../hooks/useSize';
import { isVNode } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import { isString, isNumber } from 'lodash-es';
import type { PropType } from 'vue';

enum Align {
  top = 'flex-start',
  center = 'center',
  bottom = 'flex-end',
}

export default defineComponent({
  name: 'QmSpace',
  componentName: 'QmSpace',
  props: {
    alignment: PropTypes.oneOf(['top', 'center', 'bottom']).def('center'),
    direction: PropTypes.oneOf(['vertical', 'horizontal']).def('horizontal'),
    size: {
      type: [Number, String] as PropType<number | string>,
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidComponentSize(val as string);
      },
    },
    wrap: PropTypes.bool.def(true),
    spacer: {
      type: [String, Object] as PropType<string | JSXNode>,
      default: null,
      validator: (val: unknown): boolean => {
        return isVNode(val) || isString(val);
      },
    },
  },
  computed: {
    align(): string {
      return Align[this.alignment];
    },
  },
  render(): JSXNode {
    const { align, spacer, size, wrap } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('space');
    const cls = {
      [prefixCls]: true,
    };
    const wrapProps = {
      alignment: align,
      spacer,
      size: size ?? $size,
      wrap,
    };
    return (
      <el-space class={cls} {...wrapProps}>
        {this.$slots.default?.()}
      </el-space>
    );
  },
});
