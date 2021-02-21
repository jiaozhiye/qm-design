/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 18:50:30
 */
import { defineComponent, PropType, isVNode } from 'vue';
import { JSXNode } from '../../_utils/types';
import { isString, isNull } from 'lodash-es';
import DividerExpand from './divider-expand';

import { useGlobalConfig } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';

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
  emits: ['update:collapse'],
  methods: {
    doToggle(val: boolean): void {
      // template -> v-model:collapse="this.expand"   JSX -> v-model={[this.expand, 'collapse']}
      this.$emit('update:collapse', val);
    },
  },
  render(): JSXNode {
    const { label, extra, collapse } = this;
    const $DESIGN = useGlobalConfig();
    const prefixCls = getPrefixCls('divider');
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $DESIGN.size === 'medium',
      [`${prefixCls}--small`]: $DESIGN.size === 'small',
      [`${prefixCls}--mini`]: $DESIGN.size === 'mini',
    };
    return (
      <div class={cls}>
        <span class={`${prefixCls}__title`}>{label}</span>
        {extra && <div class={`${prefixCls}__extra`}>{extra}</div>}
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
