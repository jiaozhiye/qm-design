/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 10:19:45
 */
import { defineComponent } from 'vue';
import { t } from '../../../locale';
import config from '../config';

import Dialog from '../../../Dialog';
import GroupSummarySetting from './setting';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'GroupSummary',
  props: ['columns'],
  inject: ['$$table'],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    clickHandle() {
      this.visible = true;
    },
    closeHandle(val) {
      this.visible = val;
    },
  },
  render(): JSXNode {
    const { visible } = this;
    const wrapProps = {
      visible,
      title: t('qm.table.groupSummary.settingTitle'),
      width: '1000px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    const columns = this.columns.filter(
      (x) => !['__expandable__', '__selection__', 'index', 'pageIndex', config.operationColumn].includes(x.dataIndex)
    );
    const cls = [`group-summary--wrapper`, `size--${this.$$table.tableSize}`];
    return (
      <div class={cls}>
        <span class="summary-button" title={t('qm.table.groupSummary.text')} onClick={this.clickHandle}>
          <i class="iconfont icon-piechart" />
        </span>
        <Dialog {...wrapProps}>
          <GroupSummarySetting columns={columns} onClose={this.closeHandle} />
        </Dialog>
      </div>
    );
  },
});
