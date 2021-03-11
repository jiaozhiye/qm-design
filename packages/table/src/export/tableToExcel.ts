/*
 * @Author: 焦质晔
 * @Date: 2020-12-23 13:13:25
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 10:42:39
 */
import { utils, write } from 'xlsx';

const XLSX = {
  utils,
  write,
};

const ExcellentExport = (function () {
  const b64toBlob = function (b64Data, contentType, sliceSize?: number) {
    // function taken from http://stackoverflow.com/a/16245768/2591950
    // author Jeremy Banks http://stackoverflow.com/users/1114/jeremy-banks
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    const byteCharacters = window.atob(b64Data);
    const byteArrays = [];

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

  const version = '3.5.0';
  const template = {
    excel:
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta name=ProgId content=Excel.Sheet><meta name=Generator content="Microsoft Excel 11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>',
  };
  let csvDelimiter = ',';
  let csvNewLine = '\r\n';

  /**
   * Convert a string to Base64.
   *
   * @param {string} s
   */
  const base64 = function (s) {
    return window.btoa(unescape(encodeURIComponent(s)));
  };

  const format = function (s, c) {
    return s.replace(new RegExp('{(\\w+)}', 'g'), function (m, p) {
      return c[p];
    });
  };

  const parseNode = function (s) {
    const node = document.createElement('div');
    node.innerHTML = s;
    return node.firstChild;
  };

  /**
   * Get element by ID.
   * @param {*} element
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const get = function (element) {
    if (!element.nodeType) {
      return document.getElementById(element);
    }
    return element;
  };

  /**
   * Encode a value for CSV.
   * @param {*} value
   */
  const fixCSVField = function (value) {
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

  const tableToArray = function (table) {
    const tableInfo = Array.prototype.map.call(table.querySelectorAll('tr'), function (tr) {
      return Array.prototype.map.call(tr.querySelectorAll('th,td'), function (td) {
        return td.innerHTML;
      });
    });
    return tableInfo;
  };

  const tableToCSV = function (table) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createDownloadLink = function (anchor, base64data, exporttype, filename) {
    if (window.navigator.msSaveBlob) {
      const blob = b64toBlob(base64data, exporttype);
      window.navigator.msSaveBlob(blob, filename);
      return false;
    } else if (window.URL.createObjectURL) {
      const blob = b64toBlob(base64data, exporttype);
      anchor.href = window.URL.createObjectURL(blob);
    } else {
      anchor.download = filename;
      anchor.href = 'data:' + exporttype + ';base64,' + base64data;
    }

    return true;
  };

  // String to ArrayBuffer
  const s2ab = function (s) {
    if (typeof ArrayBuffer !== 'undefined') {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    } else {
      const buf = new Array(s.length);
      for (let i = 0; i !== s.length; ++i) {
        buf[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }
  };

  const removeColumn = function (arr2d, colIndex) {
    for (let i = 0; i < arr2d.length; i++) {
      const row = arr2d[i];
      row.splice(colIndex, 1);
    }
  };

  /**
    ExcellentExport.convert(options, sheets);

    Options: object
    {
      format: 'xlsx'/'xls'/'csv'
    }

    Sheet: array
    [
      {
        name: 'Sheet 1', // Sheet name
        from: {
            tableHTML: String, // Html Text
            array: [...], // Array with data
            arrayHasHeader: true, // Array first row is the header
            removeColumns: [...], // Array of column indexes (from 0)
            filterRowFn: function(row) {return true}, // Function to decide which rows are returned
            fixValue: function(value, row, column) {return fixedValue} // Function to fix values, receiving value, row num, column num
            fixArray: function(array) {return array} // Function to manipulate the whole data array
        },
      },
      ...
    ]
  */
  const convert = function (options, sheets) {
    const workbook = {
      SheetNames: [],
      Sheets: {},
    };

    if (!options.format) {
      throw new Error("'format' option must be defined");
    }
    if (options.format === 'csv' && sheets.length > 1) {
      throw new Error("'csv' format only supports one sheet");
    }

    sheets.forEach(function (sheetConf, index) {
      const name = sheetConf.name;
      if (!name) {
        throw new Error('Sheet ' + index + ' must have the property "name".');
      }

      // Select data source
      let worksheet = null;
      let dataArray;
      if (sheetConf.from && sheetConf.from.tableHTML) {
        dataArray = tableToArray(parseNode(sheetConf.from.tableHTML));
      } else if (sheetConf.from && sheetConf.from.array) {
        dataArray = sheetConf.from.array;
      } else {
        throw new Error('No data for sheet: [' + name + ']');
      }

      // Filter rows
      if (sheetConf.filterRowFn) {
        if (sheetConf.filterRowFn instanceof Function) {
          dataArray = dataArray.filter(sheetConf.filterRowFn);
        } else {
          throw new Error('Parameter "filterRowFn" must be a function.');
        }
      }
      // Filter columns
      if (sheetConf.removeColumns) {
        const toRemove = sheetConf.removeColumns.sort().reverse();
        toRemove.forEach(function (columnIndex) {
          removeColumn(dataArray, columnIndex);
        });
      }

      // Convert data, by value
      if (sheetConf.fixValue && typeof sheetConf.fixValue === 'function') {
        const fn = sheetConf.fixValue;
        dataArray.map((r, rownum) => {
          r.map((value, colnum) => {
            dataArray[rownum][colnum] = fn(value, rownum, colnum);
          });
        });
      }

      // Convert data, whole array
      if (sheetConf.fixArray && typeof sheetConf.fixArray === 'function') {
        const fn = sheetConf.fixArray;
        dataArray = fn(dataArray);
      }

      // Create sheet
      workbook.SheetNames.push(name);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      worksheet = XLSX.utils.aoa_to_sheet(dataArray, { sheet: name });
      workbook.Sheets[name] = worksheet;
    });

    // create xlsx
    const wbOut = XLSX.write(workbook, { bookType: options.format, bookSST: true, type: 'binary' });
    const blob = new Blob([s2ab(wbOut) as any], { type: 'application/octet-stream' });

    return blob;
  };

  return {
    version: function () {
      return version;
    },
    excel: function (tableHTML, name) {
      const ctx = { worksheet: name || 'sheet1', table: tableHTML };
      const b64 = base64(format(template.excel, ctx));
      return b64toBlob(b64, 'application/vnd.ms-excel');
    },
    csv: function (tableHTML, delimiter, newLine) {
      if (delimiter !== undefined && delimiter) {
        csvDelimiter = delimiter;
      }
      if (newLine !== undefined && newLine) {
        csvNewLine = newLine;
      }
      const csvData = '\uFEFF' + tableToCSV(parseNode(tableHTML));
      const b64 = base64(csvData);
      return b64toBlob(b64, 'application/csv');
    },
    convert: function (options, sheets) {
      return convert(options, sheets);
    },
  };
})();

export default ExcellentExport;
