/*
 * @Author: 焦质晔
 * @Date: 2021-04-07 08:23:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-04-07 11:43:19
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

import Form from '../../../form';

export default defineComponent({
  name: 'ExportSetting',
  componentName: 'ExportSetting',
  emits: ['change', 'close'],
  props: ['defaultValue'],
  inject: ['$$table'],
  data() {
    return {
      initialValue: this.getInitialvalue(),
      formList: this.createFormList(),
    };
  },
  methods: {
    getInitialvalue() {
      return Object.assign(
        {},
        {
          fieldName: `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
          fileType: 'xlsx',
          sheetName: 'sheet1',
          exportType: 'all',
          'startIndex|endIndex': [1, this.$$table.total],
          footSummation: 1,
          useStyle: 0,
        },
        this.defaultValue
      );
    },
    createFormList() {
      return [
        {
          type: 'INPUT',
          label: t('qm.table.export.fileName'),
          fieldName: 'fileName',
        },
        {
          type: 'SELECT',
          label: t('qm.table.export.fileType'),
          fieldName: 'fileType',
          options: {
            itemList: [
              { text: 'xlsx', value: 'xlsx' },
              { text: 'csv', value: 'csv' },
            ],
          },
        },
        {
          type: 'INPUT',
          label: t('qm.table.export.sheetName'),
          fieldName: 'sheetName',
        },
        {
          type: 'RANGE_INPUT_NUMBER',
          label: '',
          fieldName: 'startIndex|endIndex',
          labelOptions: {
            type: 'SELECT',
            fieldName: 'exportType',
            options: {
              itemList: [
                { text: t('qm.table.export.all'), value: 'all' },
                { text: t('qm.table.export.selected'), value: 'selected', disabled: this.$$table.rowSelection?.type !== 'checkbox' },
                { text: t('qm.table.export.custom'), value: 'custom' },
              ],
            },
            onChange: (val: string): void => {
              this.formList.find((x) => x.fieldName === 'startIndex|endIndex').disabled = val !== 'custom';
            },
          },
          options: {
            min: 1,
          },
          disabled: true,
        },
        {
          type: 'CHECKBOX',
          label: t('qm.table.export.footSummation'),
          fieldName: 'footSummation',
          options: {
            trueValue: 1,
            falseValue: 0,
          },
        },
        {
          type: 'CHECKBOX',
          label: t('qm.table.export.useStyle'),
          fieldName: 'useStyle',
          options: {
            trueValue: 1,
            falseValue: 0,
          },
        },
      ];
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
    async confirmHandle(): Promise<void> {
      const [err, data] = await this.$refs[`form`].GET_FORM_DATA();
      if (err) return;
      for (let key in data) {
        if (key === 'footSummation' || key === 'useStyle') {
          data[key] = !!data[key];
        }
      }
      this.$emit('change', data);
      this.cancelHandle();
    },
  },
  render(): JSXNode {
    const { initialValue, formList } = this;
    return (
      <div>
        <Form
          ref="form"
          // @ts-ignore
          initialValue={initialValue}
          list={formList}
          cols={1}
          labelWidth={110}
        />
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
          <el-button onClick={() => this.cancelHandle()}>{t('qm.table.export.closeButton')}</el-button>
          <el-button type="primary" onClick={() => this.confirmHandle()}>
            {t('qm.table.export.text')}
          </el-button>
        </div>
      </div>
    );
  },
});
