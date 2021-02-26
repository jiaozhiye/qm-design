/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 12:40:28
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import Divider from '../../divider';

export default defineComponent({
  name: 'FormDivider',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { type, label } = this.option;
    // @ts-ignore: 无法被执行的代码的错误
    return <Divider label={label} />;
  },
});
