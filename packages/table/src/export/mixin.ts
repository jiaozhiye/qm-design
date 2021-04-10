/*
 * @Author: 焦质晔
 * @Date: 2021-04-06 13:37:24
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-04-09 10:47:46
 */
import ExcelJS from 'exceljs';
import { isFunction } from 'lodash-es';
import { getCellValue, convertToRows, deepFindColumn } from '../utils';
import { download } from '../../../_utils/download';
import { t } from '../../../locale';
import { IAlign, IColumn, IRecord } from '../table/types';
import { AnyObject } from '../../../_utils/types';

type ISheetMerge = {
  s: { r: number; c: number };
  e: { r: number; c: number };
};

type ISheetCol = {
  key: string;
  width: number;
};

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

const defaultHeaderBackgroundColor = 'f5f5f5';
const defaultCellFontColor = '606060';
const defaultCellBorderStyle = 'thin';
const defaultCellBorderColor = 'd4d4d4';

const setExcelRowHeight = (excelRow, height: number): void => {
  if (height) {
    excelRow.height = Math.floor(height * 0.75);
  }
};

const setExcelCellStyle = (excelCell, align?: IAlign): void => {
  excelCell.protection = {
    locked: false,
  };
  excelCell.alignment = {
    vertical: 'middle',
    horizontal: align || 'left',
  };
};

const getDefaultBorderStyle = () => {
  return {
    top: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor,
      },
    },
    left: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor,
      },
    },
    bottom: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor,
      },
    },
    right: {
      style: defaultCellBorderStyle,
      color: {
        argb: defaultCellBorderColor,
      },
    },
  };
};

const getValidColumn = (column: IColumn): IColumn => {
  const { children } = column;
  if (children && children.length) {
    return getValidColumn(children[0]);
  }
  return column;
};

const exportMixin = {
  methods: {
    exportXLSX(options: IOptions, dataList: IRecord[]): void {
      const { footSummation } = options;
      const {
        spanMethod,
        showHeader,
        isGroup,
        showFooter,
        scrollYStore: { rowHeight },
        $$tableBody,
      } = this.$$table;
      const { getSpan } = $$tableBody;
      const { flatColumns: columns, headColumns } = this;
      const colGroups = convertToRows(headColumns);
      const colList: unknown[] = [];
      const footList: unknown[] = [];
      const sheetCols: ISheetCol[] = [];
      const sheetMerges: ISheetMerge[] = [];
      let beforeRowCount = 0;

      // 处理表头
      const colHead: AnyObject<string> = {};
      columns.forEach((column: IColumn) => {
        const { dataIndex, title, width, renderWidth } = column;
        colHead[dataIndex] = title;
        sheetCols.push({
          key: dataIndex,
          width: ((width || renderWidth || 100) as number) / 8,
        });
      });

      if (showHeader) {
        // 表头分组
        if (isGroup) {
          colGroups.forEach((cols: IColumn[], rowIndex: number) => {
            const groupHead: AnyObject<string> = {};
            cols.forEach((column: IColumn & { colSpan: number; rowSpan: number }) => {
              const { colSpan, rowSpan } = column;
              const validColumn: IColumn = getValidColumn(column);
              const columnIndex: number = columns.findIndex(({ dataIndex }) => dataIndex === validColumn.dataIndex);
              groupHead[validColumn.dataIndex] = column.title;
              // 处理列合并
              if (colSpan !== 0 && (colSpan > 1 || rowSpan > 1)) {
                sheetMerges.push({
                  s: { r: rowIndex, c: columnIndex },
                  e: { r: rowIndex + rowSpan - 1, c: columnIndex + colSpan - 1 },
                });
              }
            });
            colList.push(groupHead);
          });
        } else {
          columns.forEach((column: IColumn & { colSpan: number; rowSpan: number }, columnIndex: number) => {
            const { colSpan, rowSpan } = column;
            // 处理列合并
            if (colSpan > 1 || rowSpan > 1) {
              sheetMerges.push({
                s: { r: beforeRowCount, c: columnIndex },
                e: { r: beforeRowCount + rowSpan - 1, c: columnIndex + colSpan - 1 },
              });
            }
          });
          colList.push(colHead);
        }
        beforeRowCount += colList.length;
      }

      // 处理数据
      const rowList = dataList.map((row: IRecord, rowIndex: number) => {
        const colBody: AnyObject<string | number> = {};
        columns.forEach((column: IColumn, columnIndex: number) => {
          // 处理合并
          if (isFunction(spanMethod)) {
            const { rowspan, colspan } = getSpan(row, column, rowIndex, columnIndex);
            if (colspan > 1 || rowspan > 1) {
              sheetMerges.push({
                s: { r: rowIndex + beforeRowCount, c: columnIndex },
                e: { r: rowIndex + beforeRowCount + rowspan - 1, c: columnIndex + colspan - 1 },
              });
            }
          }
          colBody[column.dataIndex] = this.renderCell(row, rowIndex, column, columnIndex);
        });
        return colBody;
      });
      beforeRowCount += rowList.length;

      // 处理表尾
      const summationRows = columns.some((column: IColumn) => !!column.summation) ? this.$$table.$refs[`tableFooter`].summationRows : [];
      if (showFooter && footSummation) {
        summationRows.forEach((row: IRecord, rowIndex: number) => {
          const colFoot: AnyObject<string> = {};
          columns.forEach((column: IColumn, columnIndex: number) => {
            const { dataIndex, summation } = column;
            const text = summation?.render ? summation.render(dataList) : getCellValue(row, dataIndex);
            colFoot[dataIndex] = columnIndex === 0 && text === '' ? t('qm.table.config.summaryText') : text;
          });
          footList.push(colFoot);
        });
      }

      const exportMethod = () => {
        const { fileName, sheetName, useStyle } = options;
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(sheetName);
        sheet.columns = sheetCols;
        if (showHeader) {
          sheet.addRows(colList).forEach((excelRow) => {
            if (useStyle) {
              setExcelRowHeight(excelRow, rowHeight);
            }
            excelRow.eachCell((excelCell) => {
              const excelCol = sheet.getColumn(excelCell.col);
              const column: IColumn = deepFindColumn(headColumns, excelCol.key as string) as IColumn;
              const { theadAlign, align } = column;
              setExcelCellStyle(excelCell, theadAlign || align);
              if (useStyle) {
                Object.assign(excelCell, {
                  font: {
                    bold: true,
                    color: {
                      argb: defaultCellFontColor,
                    },
                  },
                  fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {
                      argb: defaultHeaderBackgroundColor,
                    },
                  },
                  border: getDefaultBorderStyle(),
                });
              }
            });
          });
        }
        sheet.addRows(rowList).forEach((excelRow) => {
          if (useStyle) {
            setExcelRowHeight(excelRow, rowHeight);
          }
          excelRow.eachCell((excelCell) => {
            const excelCol = sheet.getColumn(excelCell.col);
            const column: IColumn = deepFindColumn(headColumns, excelCol.key as string) as IColumn;
            const { align } = column;
            setExcelCellStyle(excelCell, align);
            if (useStyle) {
              Object.assign(excelCell, {
                font: {
                  color: {
                    argb: defaultCellFontColor,
                  },
                },
                border: getDefaultBorderStyle(),
              });
            }
          });
        });
        if (showFooter) {
          sheet.addRows(footList).forEach((excelRow) => {
            if (useStyle) {
              setExcelRowHeight(excelRow, rowHeight);
            }
            excelRow.eachCell((excelCell) => {
              const excelCol = sheet.getColumn(excelCell.col);
              const column: IColumn = deepFindColumn(headColumns, excelCol.key as string) as IColumn;
              const { align } = column;
              setExcelCellStyle(excelCell, align);
              if (useStyle) {
                Object.assign(excelCell, {
                  font: {
                    color: {
                      argb: defaultCellFontColor,
                    },
                  },
                  border: getDefaultBorderStyle(),
                });
              }
            });
          });
        }
        sheetMerges.forEach(({ s, e }) => {
          sheet.mergeCells(s.r + 1, s.c + 1, e.r + 1, e.c + 1);
        });
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob: Blob = new Blob([buffer], { type: 'application/octet-stream' });
          download(blob, `${fileName}.xlsx`);
        });
      };

      // 执行导出
      exportMethod();
    },
    exportCSV(options: IOptions, tableHTML: string): void {
      const { fileName } = options;

      const b64toBlob = (b64Data, contentType, sliceSize?: number) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = window.atob(b64Data);
        const byteArrays: Uint8Array[] = [];

        let offset;
        for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          let i;
          for (i = 0; i < slice.length; i = i + 1) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new window.Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        return new window.Blob(byteArrays, {
          type: contentType,
        });
      };

      const csvDelimiter = ',';
      const csvNewLine = '\r\n';

      const base64 = (s) => {
        return window.btoa(unescape(encodeURIComponent(s)));
      };

      const parseNode = (s) => {
        const node = document.createElement('div');
        node.innerHTML = s;
        return node.firstChild;
      };

      const fixCSVField = (value) => {
        let fixedValue = value;
        const addQuotes = value.indexOf(csvDelimiter) !== -1 || value.indexOf('\r') !== -1 || value.indexOf('\n') !== -1;
        const replaceDoubleQuotes = value.indexOf('"') !== -1;

        if (replaceDoubleQuotes) {
          fixedValue = fixedValue.replace(/"/g, '""');
        }
        if (addQuotes || replaceDoubleQuotes) {
          fixedValue = '"' + fixedValue + '"';
        }

        return fixedValue;
      };

      const tableToCSV = (table) => {
        let data = '';
        let i, j, row, col;
        for (i = 0; i < table.rows.length; i = i + 1) {
          row = table.rows[i];
          for (j = 0; j < row.cells.length; j = j + 1) {
            col = row.cells[j];
            data = data + (j ? csvDelimiter : '') + fixCSVField(col.textContent.trim());
          }
          data = data + csvNewLine;
        }
        return data;
      };

      const csvData = '\uFEFF' + tableToCSV(parseNode(tableHTML));
      const b64 = base64(csvData);
      const blob = b64toBlob(b64, 'application/csv');
      download(blob, `${fileName}.csv`);
    },
  },
};

export default exportMixin;
