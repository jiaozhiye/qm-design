/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-19 14:36:18
 */
import { defineComponent, CSSProperties } from 'vue';
import { isString, isNumber } from 'lodash-es';
import PropTypes from '../../_utils/vue-types';
import { JSXNode } from '../../_utils/types';
import { useSize } from '../../hooks/useSize';
import { isVNode } from '../../_utils/util';
import { isValidComponentSize } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import type { PropType } from 'vue';

enum Align {
  top = 'flex-start',
  center = 'center',
  bottom = 'flex-end',
}

enum Arrange {
  left = 'flex-start',
  center = 'center',
  right = 'flex-end',
}

enum space {
  default = 14,
  medium = 12,
  small = 10,
  mini = 8,
}

export default defineComponent({
  name: 'QmSpace',
  componentName: 'QmSpace',
  props: {
    alignment: PropTypes.oneOf(['top', 'center', 'bottom']).def('center'),
    direction: PropTypes.oneOf(['vertical', 'horizontal']).def('horizontal'),
    arrangement: PropTypes.oneOf(['left', 'center', 'right']).def('left'),
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
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  computed: {
    align(): string {
      return Align[this.alignment];
    },
    arrange(): string {
      return Arrange[this.arrangement];
    },
  },
  render(): JSXNode {
    const { align, arrange, spacer, size, wrap, containerStyle } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('space');
    const rsize = isNumber(size) ? size : space[size || $size || 'default'];
    const cls = {
      [prefixCls]: true,
    };
    const wrapProps = {
      alignment: align,
      size: rsize,
      spacer,
      wrap,
      style: { marginRight: `-${rsize}px` },
    };
    return (
      <div class={cls} style={[{ justifyContent: arrange }, containerStyle]}>
        <el-space {...wrapProps}>{this.$slots.default?.()}</el-space>
      </div>
    );
  },
});
