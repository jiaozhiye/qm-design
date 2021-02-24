/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 12:32:19
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormInput',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    return <div>input</div>;
  },
});
