/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 13:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 13:56:59
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Pager',
  data() {
    return {};
  },
  render(): JSXNode {
    return <el-pagination />;
  },
});
