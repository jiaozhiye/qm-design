/*
 * @Author: 焦质晔
 * @Date: 2020-03-29 14:18:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 15:13:33
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Reload',
  inject: ['$$table'],
  methods: {
    clickHandle(): void {
      this.$$table.getTableData();
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    return (
      <span class={`${prefixCls}-reload`} title={t('qm.table.refresh.text')} onClick={this.clickHandle}>
        <i class="iconfont icon-reload" />
      </span>
    );
  },
});
