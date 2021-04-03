/*
 * @Author: 焦质晔
 * @Date: 2020-02-02 15:58:17
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 16:22:59
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { isFunction } from 'lodash-es';

import { getCellValue, setCellValue, convertToRows, filterTableColumns } from '../utils';
import { deepToRaw } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { download } from '../../../_utils/download';
import { IColumn, IDerivedColumn, IFetch, IRecord } from '../table/types';
import { JSXNode, Nullable, AnyObject } from '../../../_utils/types';

import config from '../config';
import JsonToExcel from './jsonToExcel';
import ExcellentExport from './tableToExcel';

export default defineComponent({
  name: 'Export',
  props: ['tableColumns', 'flattenColumns', 'fileName', 'fetch'],
  inject: ['$$table'],
  data() {
    return {
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
    fields(): AnyObject<unknown> {
      const target = {};
      this.flatColumns.forEach((x) => {
        target[x.title] = x.dataIndex;
      });
      return target;
    },
    disabledState(): boolean {
      return !this.$$table.total || this.exporting;
    },
  },
  methods: {
    createDataList(list: IRecord[]) {
      return list.map((x, i) => {
        let item = { ...x, index: i, pageIndex: i };
        this.flatColumns.forEach((column, index) => {
          const { dataIndex } = column;
          setCellValue(item, dataIndex, this.renderCell(item, item.index, column, index));
        });
        return item;
      });
    },
    createFetchParams(fetch: IFetch & { total: number }): Nullable<{ fetch: IFetch }> {
      if (!fetch) {
        return null;
      }
      const { api, dataKey, total } = fetch;
      return {
        fetch: {
          api,
          params: {
            ...this.$$table.fetchParams,
            currentPage: 1,
            pageSize: total,
          },
          dataKey,
        },
      };
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
    localExportHandle(fileName: string): void {
      const tableHTML = this._toTable(convertToRows(this.headColumns), this.flatColumns);
      const blob = ExcellentExport.excel(tableHTML);
      download(blob, fileName);
      this.recordExportLog();
    },
    _toTable(columnRows: Array<IDerivedColumn[]>, flatColumns: IColumn[]) {
      const { tableFullData, showHeader, showFooter, $refs } = this.$$table;
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
                `<tr>${columns.map((column) => `<th colspan="${column.colSpan}" rowspan="${column.rowSpan}">${column.title}</th>`).join('')}</tr>`
            )
            .join(''),
          `</thead>`,
        ].join('');
      }
      if (tableFullData.length) {
        html += `<tbody>${tableFullData
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { rowspan, colspan } = this.$$table.$$tableBody.getSpan(row, column, row.index, index);
                  if (!rowspan || !colspan) {
                    return null;
                  }
                  return `<td rowspan="${rowspan}" colspan="${colspan}">${this.renderCell(row, row.index, column, index)}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}</tbody>`;
      }
      if (showFooter) {
        html += [
          `<tfoot>`,
          summationRows
            .map(
              (row) =>
                `<tr>${flatColumns
                  .map((column, index) => {
                    let text = getCellValue(row, column.dataIndex);
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
    renderCell(row: IRecord, rowIndex: number, column: IColumn, columnIndex: number) {
      const { dataIndex, precision, extraRender } = column;
      let result = this.$$table.$$tableBody.renderCellTitle(column, row, rowIndex, columnIndex);
      if (extraRender) {
        result = extraRender(getCellValue(row, dataIndex), row, column, rowIndex, columnIndex);
      }
      // 处理 number 类型
      if (precision && precision >= 0 && result !== '') {
        result = Number(result);
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
    const { tableFullData } = this.$$table;
    const { fields, fileName, fetch, exportFetch, disabledState } = this;
    const prefixCls = getPrefixCls('table');
    const exportFileName = fileName ?? `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`;
    const exportFileType = exportFileName.slice(exportFileName.lastIndexOf('.') + 1).toLowerCase();
    const toExcelProps = {
      initialValue: tableFullData,
      fields,
      fileType: exportFileType,
      fileName: exportFileName,
      ...this.createFetchParams(fetch),
      formatHandle: this.createDataList,
      onSuccess: () => {
        this.recordExportLog();
      },
    };
    const isJsonToExcel = !(exportFetch || exportFileType === 'xls');
    const cls = {
      [`${prefixCls}-export`]: true,
      disabled: disabledState,
    };
    return (
      <span
        class={cls}
        title={t('qm.table.export.text')}
        onClick={() => {
          if (disabledState) return;
          if (isJsonToExcel) {
            return this.$refs[`json-to-excel`].DO_EXPORT();
          }
          exportFetch ? this.exportHandle(exportFileName) : this.localExportHandle(exportFileName);
        }}
      >
        {isJsonToExcel ? <JsonToExcel ref="json-to-excel" {...toExcelProps} /> : <i class="iconfont icon-download" />}
      </span>
    );
  },
});
