/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-21 13:47:28
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

import Dialog from '../../../dialog';
import SelectCollectionResult from './result';

export default defineComponent({
  name: 'SelectCollection',
  props: ['columns'],
  inject: ['$$table'],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    clickHandle(): void {
      this.visible = true;
    },
    closeHandle(val: boolean): void {
      this.visible = val;
    },
  },
  render(): JSXNode {
    const { visible } = this;
    const { selectionKeys, selectionRows } = this.$$table;
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.selectCollection.settingTitle'),
      width: '1100px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    return (
      <>
        <span class={`${prefixCls}-select-collection`} title={t('qm.table.selectCollection.text')} onClick={this.clickHandle}>
          <i class="iconfont icon-check-square" />
        </span>
        <Dialog {...wrapProps}>
          <SelectCollectionResult columns={this.columns} selectionKeys={selectionKeys} selectionRows={selectionRows} onClose={this.closeHandle} />
        </Dialog>
      </>
    );
  },
});
