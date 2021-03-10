/*
 * @Author: 焦质晔
 * @Date: 2020-03-29 14:18:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 11:21:42
 */
import { defineComponent } from 'vue';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Reload',
  inject: ['$$table'],
  methods: {
    clickHandle() {
      this.$$table.getTableData();
    },
  },
  render(): JSXNode {
    const cls = [`reload-data`, `size--${this.$$table.tableSize}`];
    return (
      <span class={cls} title={t('qm.table.refresh.text')} onClick={this.clickHandle}>
        <i class="iconfont icon-reload" />
      </span>
    );
  },
});
