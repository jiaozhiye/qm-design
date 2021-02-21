/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 17:13:56
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 18:20:12
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';

export default defineComponent({
  name: 'DividerExpand',
  inject: ['$$divider'],
  props: {
    expand: {
      type: Boolean,
    },
  },
  methods: {
    clickHandle(): void {
      this.$$divider.doToggle(!this.expand);
    },
  },
  render(): JSXNode {
    const { expand } = this;
    return (
      <el-button type="text" onClick={this.clickHandle}>
        {expand ? t('qm.divider.collect') : t('qm.divider.spread')}{' '}
        <i class={expand ? 'el-icon-arrow-up' : 'el-icon-arrow-down'} />
      </el-button>
    );
  },
});
