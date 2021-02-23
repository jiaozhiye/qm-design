/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 08:48:51
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 13:35:41
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'QmTabPane',
  componentName: 'QmTabPane',
  inheritAttrs: false,
  props: {
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  render(): JSXNode {
    return this.$slots.default?.();
  },
});
