/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 10:20:13
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import config from '../config';

import Dialog from '../../../dialog';
import HighSearchSetting from './setting';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'HighSearch',
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
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.highSearch.settingTitle'),
      width: '1100px',
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
    return (
      <>
        <span class={`${prefixCls}-super-search`} title={t('qm.table.highSearch.text')} onClick={this.clickHandle}>
          <i class="iconfont icon-funnelplot" />
        </span>
        <Dialog {...wrapProps}>
          <HighSearchSetting columns={columns} onClose={this.closeHandle} />
        </Dialog>
      </>
    );
  },
});
