/*
 * @Author: 焦质晔
 * @Date: 2020-05-20 09:36:38
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-21 14:04:05
 */
import { defineComponent } from 'vue';
import { cloneDeep } from 'lodash-es';
import { t } from '../../../locale';
import { IColumn } from '../table/types';
import { JSXNode } from '../../../_utils/types';
import config from '../config';

import VTable from '../table';

export default defineComponent({
  name: 'SelectCollectionResult',
  props: ['columns', 'selectionKeys', 'selectionRows', 'onClose'],
  inject: ['$$table'],
  data() {
    return {
      vColumns: this.createColumns(),
      list: cloneDeep(this.selectionRows),
      selection: {
        type: 'checkbox',
        selectedRowKeys: [...this.selectionKeys],
        onChange: (val) => {
          this.setSelectionKeys(val);
        },
      },
    };
  },
  methods: {
    setSelectionKeys(keys: string[]): void {
      this.$$table.selectionKeys = keys;
    },
    createFilterColumns(columns: IColumn[]): IColumn[] {
      return columns.map((column) => {
        const item: IColumn = {
          dataIndex: column.dataIndex,
          title: column.title,
          width: column.width || 100,
          ...((column.precision as number) >= 0 ? { precision: column.precision } : null),
          dictItems: column.dictItems ?? [],
        };
        if (Array.isArray(column.children)) {
          item.children = this.createFilterColumns(column.children);
        }
        return item;
      });
    },
    createColumns(): IColumn[] {
      return this.createFilterColumns(
        this.columns.filter((column) => !['__expandable__', 'index', 'pageIndex', config.operationColumn].includes(column.dataIndex))
      );
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { vColumns, list, selection } = this;
    const { rowKey } = this.$$table;
    return (
      <div>
        <VTable
          dataSource={list}
          columns={vColumns}
          rowKey={rowKey}
          rowSelection={selection}
          minHeight={300}
          webPagination={true}
          showFullScreen={false}
          showColumnDefine={false}
          columnsChange={(columns) => (this.vColumns = columns)}
        />
        <div style="height: 10px;" />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <el-button onClick={() => this.cancelHandle()}>{t('qm.table.selectCollection.closeButton')}</el-button>
        </div>
      </div>
    );
  },
});
