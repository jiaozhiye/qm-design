/*
 * @Author: 焦质晔
 * @Date: 2020-03-29 14:18:07
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 15:04:50
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';

export default defineComponent({
  name: 'Reload',
  inject: ['$$table'],
  methods: {
    clickHandle() {
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
