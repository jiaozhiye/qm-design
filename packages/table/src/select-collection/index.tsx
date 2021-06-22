/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 15:58:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-21 13:47:28
 */
import { defineComponent } from 'vue';
import { get } from 'lodash-es';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { noop } from '../../../_utils/util';
import { IRecord } from '../table/types';
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
  mounted() {
    this.getSelectionRows();
  },
  methods: {
    async getSelectionRows(): Promise<void> {
      const {
        isFetch,
        rowSelection: { fetch, disabled = noop },
        getRowKey,
      } = this.$$table;
      if (!(isFetch && fetch)) return;
      try {
        const res = await fetch.api(fetch.params);
        if (res.code === 200) {
          const records: IRecord[] = Array.isArray(res.data) ? res.data : get(res.data, fetch.dataKey) ?? [];
          this.$$table.selectionRows = records.filter((row) => !disabled(row));
          this.$$table.selectionKeys = this.$$table.selectionRows.map((row, index) => getRowKey(row, index));
        }
      } catch (err) {}
    },
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
