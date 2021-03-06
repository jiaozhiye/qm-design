/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 13:58:44
 */
import { defineComponent, PropType, isVNode } from 'vue';
import { ComponentSize, JSXNode } from '../../_utils/types';
import { isString, isNull } from 'lodash-es';
import DividerExpand from './divider-expand';

import { useSize } from '../../hooks/useSize';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';

export default defineComponent({
  name: 'QmDivider',
  componentName: 'QmDivider',
  provide() {
    return {
      $$divider: this,
    };
  },
  props: {
    label: {
      type: String,
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    extra: {
      type: [String, Object] as PropType<string | JSXNode>,
      default: null,
      validator: (val: unknown): boolean => {
        return isVNode(val) || isString(val);
      },
    },
    collapse: {
      type: Boolean,
      default: null,
    },
  },
  emits: ['update:collapse', 'change'],
  methods: {
    doToggle(val: boolean): void {
      // template -> v-model:collapse="this.expand"   JSX -> v-model={[this.expand, 'collapse']}
      this.$emit('update:collapse', val);
      this.$emit('change', val);
    },
  },
  render(): JSXNode {
    const { label, extra, collapse } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('divider');
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };
    return (
      <div class={cls}>
        <span class={`${prefixCls}__title`}>{label}</span>
        <div class={`${prefixCls}__extra`}>{extra}</div>
        {!isNull(collapse) && (
          <span class={`${prefixCls}__collapse`}>
            {/* 受控组件 */}
            <DividerExpand expand={collapse} />
          </span>
        )}
      </div>
    );
  },
});
