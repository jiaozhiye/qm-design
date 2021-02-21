/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 09:57:50
 */
import { defineComponent } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode } from '../../_utils/types';
import { isVNode, useGlobalConfig } from '../../_utils/util';
import { isValidWidthUnit } from '../../_utils/validators';
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
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    wrap: PropTypes.bool.def(true),
    spacer: {
      type: [Object, String] as PropType<JSXNode>,
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
    const $DESIGN = useGlobalConfig();
    const prefixCls = getPrefixCls('space');
    const { align, spacer, size, wrap } = this;
    const cls = {
      [prefixCls]: true,
    };
    const wrapProps = {
      alignment: align,
      spacer,
      size: size ?? $DESIGN.size,
      wrap,
    };
    return (
      <el-space class={cls} {...wrapProps}>
        {this.$slots.default?.()}
      </el-space>
    );
  },
});
