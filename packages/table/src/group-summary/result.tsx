/*
 * @Author: 焦质晔
 * @Date: 2020-05-20 09:36:38
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-19 10:16:45
 */
import { defineComponent } from 'vue';
import { maxBy, minBy, sumBy } from 'lodash-es';
import dayjs from 'dayjs';
import { groupByProps, getCellValue, setCellValue } from '../utils';
import { JSXNode, AnyObject, Nullable } from '../../../_utils/types';
import { IColumn, IFetch, IRecord } from '../table/types';

import config from '../config';
import VTable from '../table';

export default defineComponent({
  name: 'GroupSummaryResult',
  props: ['columns', 'group', 'summary'],
  inject: ['$$table'],
  data() {
    const groupColumns = this.group.map((x) => ({
      dataIndex: x.group,
      ...this.formatColumn(x.group),
    }));
    const summaryColumns = this.summary.map((x) => {
      if (x.summary === config.groupSummary.total.value) {
        return { dataIndex: x.summary, title: config.groupSummary.total.text, formula: x.formula };
      }
      return { dataIndex: x.summary, ...this.formatColumn(x.summary), formula: x.formula };
    });
    return {
      loading: !1,
      list: [], // 汇总表格数据
      vFetch: this.createvTableFetch(),
      vColumns: this.createvTableColumns(groupColumns, summaryColumns),
      exportExcel: {
        fileName: `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`,
      },
      tablePrint: {
        showLogo: true,
      },
    };
  },
  mounted() {
    if (!this.$$table.isFetch) {
      this.list = this.createvTableData(this.$$table.tableFullData);
    }
  },
  methods: {
    formatColumn(dataIndex: string): Partial<IColumn> {
      const column = this.columns.find((x) => x.dataIndex === dataIndex);
      return {
        title: column.title,
        ...(column.precision >= 0 ? { precision: column.precision } : null),
        dictItems: column.dictItems ?? [],
      };
    },
    createvTableFetch(): Nullable<IFetch> {
      const { isFetch, fetchParams, fetch } = this.$$table;
      if (!isFetch) {
        return null;
      }
      const params = Object.assign({}, fetchParams, {
        [config.sorterFieldName]: undefined,
        [config.groupSummary.summaryFieldName]: this.summary.map((x) => `${x.formula}|${x.summary}`).join(','),
        [config.groupSummary.groupbyFieldName]: this.group.map((x) => x.group).join(','),
        usedJH: 2,
        currentPage: 1,
      });
      return Object.assign({}, fetch, { params, xhrAbort: !1 });
    },
    createvTableColumns(groupColumns: IColumn[], summaryColumns: Array<IColumn & { formula: string }>): IColumn[] {
      return [
        {
          title: '序号',
          dataIndex: 'pageIndex',
          width: 80,
          render: (text) => {
            return text + 1;
          },
        },
        ...groupColumns.map((x) => ({
          title: x.title,
          dataIndex: x.dataIndex,
          dictItems: x.dictItems,
        })),
        ...summaryColumns.map((x) => {
          let groupSummary = this.columns.find((k) => k.dataIndex === x.dataIndex)?.groupSummary;
          let summation: Nullable<AnyObject<unknown>> = groupSummary ? { summation: groupSummary } : null;
          if (x.dataIndex === config.groupSummary.total.value) {
            summation = { dataIndex: config.groupSummary.recordTotalIndex, summation: { render: () => this.$$table.total } };
          }
          return {
            ...x,
            ...(x.formula === 'count' || x.formula === 'sum' ? summation : null),
          };
        }),
      ];
    },
    createvTableData(list: IRecord[]): IRecord[] {
      const result = groupByProps(
        list,
        this.group.map((x) => x.group)
      );
      // =================
      let res: IRecord[] = [];
      result.forEach((arr) => {
        let record = {};
        this.vColumns.forEach((x) => {
          const { dataIndex } = x;
          if (dataIndex === 'index') return;
          setCellValue(record, dataIndex, getCellValue(arr[0], dataIndex));
        });
        this.summary.forEach((x) => {
          let key = x.summary !== config.groupSummary.total.value ? x.summary : config.groupSummary.recordTotalIndex;
          let fn = x.formula;
          if (fn === 'count') {
            setCellValue(record, key, arr.length);
          }
          if (fn === 'sum') {
            setCellValue(record, key, sumBy(arr, key));
          }
          if (fn === 'max') {
            setCellValue(record, key, maxBy(arr, key)[key]);
          }
          if (fn === 'min') {
            setCellValue(record, key, minBy(arr, key)[key]);
          }
          if (fn === 'avg') {
            setCellValue(record, key, (sumBy(arr, key) / arr.length).toFixed(2));
          }
        });
        res.push(record);
      });
      // =================
      return res;
    },
  },
  render(): JSXNode {
    const { vColumns, list, vFetch, exportExcel, tablePrint } = this;
    const tableProps = {
      height: 400,
      ...(this.$$table.isFetch ? { fetch: vFetch } : { dataSource: list }),
      columns: vColumns,
      rowKey: (record) => record.index,
      showFullScreen: !1,
      exportExcel,
      tablePrint,
      columnsChange: (columns) => (this.vColumns = columns),
    };
    return (
      <div>
        <VTable {...tableProps} />
      </div>
    );
  },
});
