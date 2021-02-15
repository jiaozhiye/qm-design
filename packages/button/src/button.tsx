/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-15 12:07:31
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { sleep } from '../../_utils/util';

export default defineComponent({
  name: 'QmButton',
  componentName: 'QmButton',
  methods: {
    async handleClick() {
      await sleep(1000);
      console.log(1234);
    },
  },
  render(): JSXNode {
    return (
      <el-button onClick={this.handleClick} icon="el-icon-delete">
        按钮
      </el-button>
    );
  },
});
