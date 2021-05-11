/*
 * @Author: 焦质晔
 * @Date: 2020-02-02 15:58:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 14:48:56
 */
import { defineComponent } from 'vue';
import { get, isFunction, isObject } from 'lodash-es';
import dayjs from 'dayjs';

import { getCellValue, setCellValue, convertToRows, filterTableColumns, getAllTableData } from '../utils';
import { deepToRaw } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { download } from '../../../_utils/download';
import { IColumn, IDerivedColumn, IFetch, ICellSpan, IRecord } from '../table/types';
import { JSXNode, AnyObject, Nullable } from '../../../_utils/types';

import config from '../config';
import exportMixin from './mixin';

import Dialog from '../../../dialog';
import ExportSetting from './setting';

type IOptions = {
  fileName: string;
  fileType: 'xlsx' | 'csv';
  sheetName: string;
  exportType: 'all' | 'selected' | 'custom';
  startIndex: number;
  endIndex: number;
  footSummation: boolean;
  useStyle: boolean;
};

export default defineComponent({
  name: 'Export',
  props: ['tableColumns', 'flattenColumns', 'fileName'],
  inject: ['$$table'],
  mixins: [exportMixin],
  data() {
    return {
      visible: false,
      exporting: false,
    };
  },
  computed: {
    headColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.tableColumns, ['__expandable__', '__selection__', config.operationColumn]));
    },
    flatColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.flattenColumns, ['__expandable__', '__selection__', config.operationColumn]));
    },
    exportFetch(): Nullable<IFetch> {
      return this.$$table.exportExcel.fetch ?? null;
    },
    disabledState(): boolean {
      return !this.$$table.total || this.exporting;
    },
  },
  methods: {
    createDataList(list: IRecord[]): IRecord[] {
      return list.map((x, i) => {
        let item: AnyObject<any> = { ...x, index: i, pageIndex: i };
        this.flatColumns.forEach((column, index) => {
          const { dataIndex } = column;
          if (dataIndex === 'index' || dataIndex === 'pageIndex') return;
          setCellValue(item, dataIndex, getCellValue(item, dataIndex));
        });
        return item;
      });
    },
    async getTableData(options: IOptions): Promise<void> {
      const { fileType, exportType, startIndex = 1, endIndex } = options;
      const { fetch, fetchParams, total, tableFullData, selectionKeys, getRowKey } = this.$$table;
      let tableList: IRecord[] = [];

      if (!!fetch) {
        this.exporting = !0;
        const { api, dataKey } = fetch;
        try {
          const res = await api({ ...fetchParams, currentPage: 1, pageSize: total });
          if (res.code === 200) {
            tableList = this.createDataList(Array.isArray(res.data) ? res.data : get(res.data, dataKey) ?? []);
          }
        } catch (err) {}
        this.exporting = !1;
      } else {
        tableList = getAllTableData(tableFullData);
      }

      if (exportType === 'selected') {
        tableList = tableList.filter((row: IRecord) => selectionKeys.includes(getRowKey(row, row.index)));
      }
      if (exportType === 'custom') {
        tableList = tableList.slice(startIndex - 1, endIndex ? endIndex : undefined);
      }
      if (fileType === 'xlsx') {
        this.exportXLSX(options, tableList);
      }
      if (fileType === 'csv') {
        this.exportCSV(options, this._toTable(options, convertToRows(this.headColumns), this.flatColumns, tableList));
      }

      this.recordExportLog();
    },
    async exportHandle(fileName: string): Promise<void> {
      const { fetchParams } = this.$$table;
      this.exporting = !0;
      try {
        const res = await this.exportFetch.api({
          ...fetchParams,
          tsortby: undefined,
          tsummary: undefined,
          tgroupby: undefined,
          currentPage: undefined,
          pageSize: undefined,
        });
        if (res.data) {
          download(res.data, fileName);
          this.recordExportLog();
        }
      } catch (err) {}
      this.exporting = !1;
    },
    _toTable(options: IOptions, columnRows: Array<IDerivedColumn[]>, flatColumns: IColumn[], dataList: IRecord[]): string {
      const { footSummation } = options;
      const { showHeader, showFooter, $refs } = this.$$table;
      const summationRows = flatColumns.some((x) => !!x.summation) ? $refs[`tableFooter`].summationRows : [];
      let html = `<table width="100%" border="0" cellspacing="0" cellpadding="0">`;
      html += `<colgroup>${flatColumns
        .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
        .join('')}</colgroup>`;
      if (showHeader) {
        html += [
          `<thead>`,
          columnRows
            .map(
              (columns) =>
                `<tr>${columns
                  .map((column) => {
                    const { rowSpan, colSpan } = column;
                    if (colSpan === 0) {
                      return null;
                    }
                    return `<th colspan="${colSpan}" rowspan="${rowSpan}">${column.title}</th>`;
                  })
                  .join('')}</tr>`
            )
            .join(''),
          `</thead>`,
        ].join('');
      }
      if (dataList.length) {
        html += `<tbody>${dataList
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { rowspan, colspan } = this.getSpan(row, column, row.index, index, dataList);
                  if (!rowspan || !colspan) {
                    return null;
                  }
                  return `<td rowspan="${rowspan}" colspan="${colspan}">${this.renderCell(row, row.index, column, index)}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}</tbody>`;
      }
      if (showFooter && footSummation) {
        html += [
          `<tfoot>`,
          summationRows
            .map(
              (row) =>
                `<tr>${flatColumns
                  .map((column, index) => {
                    const { dataIndex, summation } = column;
                    const text = summation?.render ? summation.render(dataList) : getCellValue(row, dataIndex);
                    return `<td>${index === 0 && text === '' ? t('qm.table.config.summaryText') : text}</td>`;
                  })
                  .join('')}</tr>`
            )
            .join(''),
          `</tfoot>`,
        ].join('');
      }
      html += '</table>';
      return html;
    },
    getSpan(row: IRecord, column: IColumn, rowIndex: number, columnIndex: number, tableData: IRecord[]): ICellSpan {
      let rowspan = 1;
      let colspan = 1;
      const fn = this.$$table.spanMethod;
      if (isFunction(fn)) {
        const result = fn({ row, column, rowIndex, columnIndex, tableData });
        if (Array.isArray(result)) {
          rowspan = result[0];
          colspan = result[1];
        } else if (isObject(result)) {
          rowspan = result.rowspan;
          colspan = result.colspan;
        }
      }
      return { rowspan, colspan };
    },
    renderCell(row: IRecord, rowIndex: number, column: IColumn, columnIndex: number): string | number {
      const { dataIndex, precision, formatType, extraRender } = column;
      let result = this.$$table.$$tableBody.renderCellTitle(column, row, rowIndex, columnIndex);
      // 处理 number 类型
      if ((precision as Number) >= 0 && !formatType && result !== '') {
        result = Number(result);
      }
      if (extraRender) {
        result = extraRender(getCellValue(row, dataIndex), row, column, rowIndex, columnIndex);
      }
      return result;
    },
    recordExportLog(): void {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        fetchFn();
      } catch (err) {}
    },
  },
  render(): JSXNode {
    const { visible, fileName, exportFetch, disabledState } = this;
    const exportFileName = fileName ?? `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
    const exportFileType = exportFileName.slice(exportFileName.lastIndexOf('.') + 1).toLowerCase();
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.export.settingTitle'),
      width: '600px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    const settingProps = {
      fileName: exportFileName.slice(0, exportFileName.lastIndexOf('.')),
      fileType: exportFileType,
      useStyle: this.$$table.exportExcel.cellStyle ? 1 : 0,
    };
    const cls = {
      [`${prefixCls}-export`]: true,
      disabled: disabledState,
    };
    return (
      <>
        <span
          class={cls}
          title={t('qm.table.export.text')}
          onClick={(): void => {
            if (disabledState) return;
            exportFetch ? this.exportHandle(exportFileName) : (this.visible = !0);
          }}
        >
          <i class="iconfont icon-download" />
        </span>
        <Dialog {...wrapProps}>
          <ExportSetting
            defaultValue={settingProps}
            onClose={(): void => {
              this.visible = !1;
            }}
            onChange={(data): void => {
              this.getTableData(data);
            }}
          />
        </Dialog>
      </>
    );
  },
});
