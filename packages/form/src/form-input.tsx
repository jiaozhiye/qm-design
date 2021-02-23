/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 22:37:38
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

export default defineComponent({
  name: 'FormInput',
  inheritAttrs: false,
  inject: ['$$form'],
  render(): JSXNode {
    return <div>input</div>;
  },
});
