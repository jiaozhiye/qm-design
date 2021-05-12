/*
 * @Author: 焦质晔
 * @Date: 2020-03-26 11:44:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-12 23:33:00
 */
import { defineComponent } from 'vue';
import { flatten, groupBy, map, spread, mergeWith } from 'lodash-es';
import { convertToRows, deepFindColumn, filterTableColumns, getCellValue } from '../utils';
import { deepToRaw } from '../../../_utils/util';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { download } from '../../../_utils/download';
import { JSXNode } from '../../../_utils/types';
import { IColumn, IDerivedColumn, IRecord } from '../table/types';

import config from '../config';

const defaultHtmlStyle = `
  * {
    margin: 0;
    padding: 0;
  }
  body * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }
  table {
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: collapse;
  }
  table--print {
    font-size: 14px;
    text-align: left;
  }
  .table--print th,
  .table--print td {
    padding: 5px;
    border: 1px solid #000;
  }
  .no-border th,
  .no-border td {
    border: 0!important;
  }
  .table--print th[colspan]:not([colspan='1']) {
    text-align: center;
  }
  .page-break {
    page-break-after: always;
  }
`;

export default defineComponent({
  name: 'PrintTable',
  props: ['tableColumns', 'flattenColumns', 'showHeader', 'showFooter', 'showLogo'],
  inject: ['$$table'],
  data() {
    return {};
  },
  computed: {
    headColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.tableColumns, ['__expandable__', '__selection__', config.operationColumn]));
    },
    flatColumns(): IColumn[] {
      return deepToRaw(filterTableColumns(this.flattenColumns, ['__expandable__', '__selection__', config.operationColumn]));
    },
  },
  methods: {
    createChunkColumnRows(chunkColumns, tableColumns): any[] {
      let res: any[] = [];
      chunkColumns.forEach((columns) => {
        let tmp: any[] = [];
        columns.forEach((column) => {
          if (column.level === 1) {
            tmp.push(column);
          } else {
            // 深度拆分列
            tmp.push(this.deepCreateColumn(column, tableColumns));
          }
        });
        // 合并列
        tmp = this.mergeColumns(tmp);
        res.push(convertToRows(tmp));
      });
      return res;
    },
    deepCreateColumn(column: IDerivedColumn, columns: IColumn[]): IDerivedColumn {
      const parent = Object.assign({}, deepFindColumn(columns, column.parentDataIndex as string)) as IDerivedColumn;
      parent.children = [column];
      if (parent.level && parent.level > 1) {
        return this.deepCreateColumn(parent, columns);
      }
      return parent;
    },
    mergeColumns(columns: IColumn[]): IColumn[] {
      const keys = [...new Set(columns.map((x) => x.dataIndex))];
      return keys.map((x) => {
        const res = columns.filter((k) => k.dataIndex === x);
        if (res.length <= 1) {
          return res[0];
        } else {
          return this.doMerge(res, 'dataIndex')[0];
        }
      });
    },
    doMerge(columns: IColumn[], mark: string): IColumn[] {
      return map(
        groupBy(flatten(columns), mark),
        spread((...rest) => {
          return mergeWith(...rest, (objValue, srcValue) => {
            if (Array.isArray(objValue)) {
              return this.doMerge(objValue.concat(srcValue), mark);
            }
          });
        })
      );
    },
    createChunkColumns(columns: IColumn[]): IColumn[][] {
      let res: any[] = [];
      let tmp: any[] = [];
      let sum = 0;
      let i = 0;
      for (; i < columns.length; ) {
        const column = columns[i];
        const w = Number(column.width || column.renderWidth || config.defaultColumnWidth);
        sum += w;
        if (sum <= config.printWidth) {
          tmp.push(column);
          if (i === columns.length - 1) {
            res.push(tmp);
          }
          i++;
        } else if (i > 0) {
          columns.splice(0, i);
          res.push(tmp);
          tmp = [];
          sum = 0;
          i = 0;
        } else {
          column.width = config.printWidth;
          tmp.push(column);
          res.push(tmp);
          i++;
        }
      }
      return res;
    },
    printHandle(): void {
      const opts = { filename: 'print', type: 'html', isDownload: false };
      this.downloadFile(opts, this.toHtml()).then(({ content, blob }) => {
        let printFrame: any = document.createElement('iframe');
        printFrame.setAttribute('frameborder', '0');
        printFrame.setAttribute('width', '100%');
        printFrame.setAttribute('height', '0');
        printFrame.style.display = 'none';
        document.body.appendChild(printFrame);
        if (this.$$table.isIE) {
          printFrame.contentDocument.write(content);
          printFrame.contentDocument.execCommand('print');
          printFrame.parentNode.removeChild(printFrame);
          printFrame = null;
        } else {
          printFrame.onload = (ev) => {
            if ((ev.target as any).src) {
              (ev.target as any).contentWindow.print();
            }
            setTimeout(() => {
              printFrame.parentNode.removeChild(printFrame);
              printFrame = null;
            });
          };
          printFrame.src = URL.createObjectURL(blob);
        }
      });
    },
    toHtml(): string {
      const chunkFlatColumns = this.createChunkColumns([...this.flatColumns]);
      const chunkColumnRows = this.createChunkColumnRows(chunkFlatColumns, this.headColumns);
      let html = [
        `<!DOCTYPE html>`,
        `<html>`,
        `<head>`,
        `<meta charset="utf-8">`,
        `<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui">`,
        `<style>${defaultHtmlStyle}</style>`,
        `</head>`,
        `<body>`,
      ].join('');
      for (let i = 0; i < chunkFlatColumns.length; i++) {
        html += this._toTable(chunkColumnRows[i], chunkFlatColumns[i]);
        html += `<div class="page-break"></div>`;
      }
      return html + `</body></html>`;
    },
    _toTable(columnRows: Array<IDerivedColumn[]>, flatColumns: IColumn[]): string {
      const { tableFullData, $refs } = this.$$table;
      const summationRows = flatColumns.some((x) => !!x.summation) ? $refs[`tableFooter`].summationRows : [];
      let html = `<table class="table--print" width="100%" border="0" cellspacing="0" cellpadding="0">`;
      html += `<colgroup>${flatColumns
        .map(({ width, renderWidth }) => `<col style="width:${width || renderWidth || config.defaultColumnWidth}px">`)
        .join('')}</colgroup>`;
      if (this.showHeader) {
        html += [
          `<thead>`,
          this.showLogo ? `<tr><th colspan="${flatColumns.length}" style="border: 0">${this._toLogo()}</th></tr>` : '',
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
      if (tableFullData.length) {
        html += `<tbody>${tableFullData
          .map(
            (row) =>
              `<tr>${flatColumns
                .map((column, index) => {
                  const { rowspan, colspan } = this.$$table.getSpan(row, column, row.index, index, tableFullData);
                  if (!rowspan || !colspan) {
                    return null;
                  }
                  return `<td rowspan="${rowspan}" colspan="${colspan}">${this.renderCell(row, row.index, column, index)}</td>`;
                })
                .join('')}</tr>`
          )
          .join('')}</tbody>`;
      }
      if (this.showFooter) {
        html += [
          `<tfoot>`,
          summationRows
            .map(
              (row) =>
                `<tr>${flatColumns
                  .map((column, index) => {
                    const { dataIndex, summation } = column;
                    const text = summation?.render ? summation.render(tableFullData) : getCellValue(row, dataIndex);
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
    _toLogo(): string {
      const baseUrl = window.location.origin;
      return `
        <table class="no-border" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="50%" align="left">
              <img src="${baseUrl}/static/img/logo_l.png" border="0" height="26" />
            </td>
            <td width="50%" align="right">
              <img src="${baseUrl}/static/img/logo_r.png" border="0" height="36" />
            </td>
          </tr>
        </table>
      `;
    },
    downloadFile(opts, content) {
      const { filename, type, isDownload } = opts;
      const name = `${filename}.${type}`;
      if (window.Blob) {
        const blob: Blob = new Blob([content], { type: `text/${type}` });
        if (!isDownload) {
          return Promise.resolve({ type, content, blob });
        }
        download(blob, name);
      }
    },
    renderCell(row: IRecord, rowIndex: number, column: IColumn, columnIndex: number): unknown {
      const { dataIndex, extraRender } = column;
      let result = this.$$table.$$tableBody.renderCellTitle(column, row, rowIndex, columnIndex);
      if (extraRender) {
        result = extraRender(getCellValue(row, dataIndex), row, column, rowIndex, columnIndex);
      }
      return result;
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    return (
      <span class={`${prefixCls}-print`} title={t('qm.table.print.text')} onClick={this.printHandle}>
        <i class="iconfont icon-printer" />
      </span>
    );
  },
});
