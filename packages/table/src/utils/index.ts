/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 08:28:55
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 20:37:28
 */
import { get, set, transform, intersection, isEqual, isObject } from 'lodash-es';
import dayjs from 'dayjs';
import { hasOwn } from '../../../_utils/util';
import { AnyFunction } from '../../../_utils/types';
import { stringify, array_format } from '../filter-sql';

export { hasOwn };

// 展平 columns
export const columnsFlatMap = (columns) => {
  const result = [];
  columns.forEach((column) => {
    if (column.children) {
      result.push(...columnsFlatMap(column.children));
    } else {
      result.push(column);
    }
  });
  return result;
};

// 筛选 columns
export const createFilterColumns = (columns) => {
  return columns.filter((column) => {
    if (column.children) {
      column.children = createFilterColumns(column.children);
    }
    return !column.hidden;
  });
};

// 深度遍历 columns
export const deepMapColumns = (columns, callback: AnyFunction<void>) => {
  return columns.map((column) => {
    if (column.children) {
      column.children.forEach((subColumn) => {
        subColumn.parentDataIndex = column.dataIndex;
        if (column.fixed) {
          subColumn.fixed = column.fixed;
        } else {
          delete subColumn.fixed;
        }
      });
      column.children = deepMapColumns(column.children, callback);
    }
    // 执行回调
    callback?.(column);
    return column;
  });
};

// 所有 columns
export const getAllColumns = (columns) => {
  const result = [];
  columns.forEach((column) => {
    result.push(column);
    if (column.children) {
      result.push(...getAllColumns(column.children));
    }
  });
  return result;
};

// 深度查找 column by dataIndex
export const deepFindColumn = (columns, mark) => {
  let result = null;
  for (let i = 0; i < columns.length; i++) {
    if (columns[i].children) {
      result = deepFindColumn(columns[i].children, mark);
    }
    if (result) {
      return result;
    }
    if (columns[i].dataIndex === mark) {
      return columns[i];
    }
  }
  return result;
};

// 查找最后一级的第一个 column
export const findFirstColumn = (column) => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[0].children) {
      return findFirstColumn(childColumns[0]);
    }
    return childColumns[0];
  }
  return column;
};

// 查找最后一级的最后一个 column
export const findLastColumn = (column) => {
  const childColumns = column.children;
  if (childColumns) {
    if (childColumns[childColumns.length - 1].children) {
      return findLastColumn(childColumns[childColumns.length - 1]);
    }
    return childColumns[childColumns.length - 1];
  }
  return column;
};

// 根据条件过滤 columns
export const filterTableColumns = (columns, marks) => {
  return columns.filter((x) => !marks.includes(x.dataIndex));
};

// 深度查找 rowKey
export const deepFindRowKey = (rowKeys, mark) => {
  let result = null;
  for (let i = 0; i < rowKeys.length; i++) {
    if (rowKeys[i].children) {
      result = deepFindRowKey(rowKeys[i].children, mark);
    }
    if (result) {
      return result;
    }
    if (rowKeys[i].rowKey === mark) {
      return rowKeys[i];
    }
  }
  return result;
};

// 所有 rowKey
export const getAllRowKeys = (data, getRowKey, disabled?: AnyFunction<boolean>) => {
  const result = [];
  data.forEach((record) => {
    if (disabled?.(record)) return;
    result.push(getRowKey(record, record.index));
    if (record.children) {
      result.push(...getAllRowKeys(record.children, getRowKey, disabled));
    }
  });
  return result;
};

// 展平 tableData
export const tableDataFlatMap = (data) => {
  const result = [];
  data.forEach((record) => {
    result.push(record);
    if (record.children) {
      result.push(...tableDataFlatMap(record.children));
    }
  });
  return result;
};

// 表头分组
export const convertToRows = (originColumns) => {
  let maxLevel = 1;

  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }

    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        if (column.fixed) {
          subColumn.fixed = column.fixed;
        } else {
          delete subColumn.fixed;
        }
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach((column) => {
    column.level = 1;
    traverse(column, null);
  });

  const rows = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(originColumns);

  allColumns.forEach((column) => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  return rows;
};

// 获取元素相对于 目标祖先元素 的位置
export const getNodeOffset = (el, container, rest = { left: 0, top: 0 }) => {
  if (el) {
    const parentElem = el.parentNode;
    rest.top += el.offsetTop;
    rest.left += el.offsetLeft;
    if (parentElem && parentElem !== document.documentElement && parentElem !== document.body) {
      rest.top -= parentElem.scrollTop;
      rest.left -= parentElem.scrollLeft;
    }
    if (container && (el === container || el.offsetParent === container) ? 0 : el.offsetParent) {
      return getNodeOffset(el.offsetParent, container, rest);
    }
  }
  return rest;
};

// 格式化 DOM 元素高度
export const parseHeight = (height) => {
  if (typeof height === 'number') {
    return height;
  }
  if (typeof height === 'string') {
    if (/^\d+(?:px)?$/.test(height)) {
      return Number.parseInt(height, 10);
    }
    return Number(height);
  }
  return null;
};

// 比对两个对象的差异
export const difference = (object, base) => {
  return transform(object, (result, value, key) => {
    if (!isEqual(value, base[key])) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
};

// 判断数组的包含
export const isArrayContain = (targetArr, arr) => {
  return intersection(targetArr, arr).length === arr.length;
};

// 获取格式化后的数据
export const getCellValue = (record, dataIndex) => {
  return get(record, dataIndex) ?? '';
};

// 设置单元格的数据
export const setCellValue = (record, dataIndex, val, precision?: number) => {
  val = val ?? '';
  if (precision >= 0 && val !== '') {
    val = Number(val).toFixed(precision);
  }
  set(record, dataIndex, val);
};

// 函数截流
export const throttle = (fn: any, delay: number): AnyFunction<void> => {
  return function (...args) {
    const nowTime: number = +new Date();
    if (!fn.lastTime || nowTime - fn.lastTime > delay) {
      fn.apply(this, args);
      fn.lastTime = nowTime;
    }
  };
};

// 函数防抖
export const debounce = (fn: any, delay = 0): AnyFunction<void> => {
  return function (...args) {
    fn.timer && clearTimeout(fn.timer);
    fn.timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// 数字格式化
export const formatNumber = (value = '') => {
  value += '';
  const list = value.split('.');
  const prefix = list[0].charAt(0) === '-' ? '-' : '';
  let num = prefix ? list[0].slice(1) : list[0];
  let result = '';
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
};

// 数值类型校验
export const validateNumber = (val) => {
  const regExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
  return (!Number.isNaN(val) && regExp.test(val)) || val === '' || val === '-';
};

// 字符串转数值类型
export const stringToNumber = (input) => {
  if (!validateNumber(input)) return '';
  input = input === '-' ? '' : input;
  return input ? Number(input) : '';
};

// 转日期对象
export const toDate = (val: string): Date => {
  return val ? dayjs(val).toDate() : undefined;
};

// 转日期格式
export const dateFormat = (val: Date, vf: string): string => {
  return val ? dayjs(val).format(vf) : '';
};

// 生成 uuid key
export const createUidKey = (key = '') => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return key + uuid;
};

// 生成排序的 sql 片段
export const createOrderBy = (sorter) => {
  const result = [];
  Object.keys(sorter).forEach((dataIndex) => {
    if (sorter[dataIndex] !== null) {
      result.push(`${dataIndex}|${sorter[dataIndex]}`);
    }
  });
  return result.join(',');
};

// 生成查询条件的 sql 片段
export const createWhereSQL = (filters, showType = false) => {
  let __query__ = ``;
  if (!Array.isArray(filters)) {
    const cutStep = 5;
    for (const key in filters) {
      const property = key.includes('|') ? key.split('|')[1] : key;
      const type = key.includes('|') ? key.split('|')[0] : '';
      const filterVal = filters[key];
      for (const mark in filterVal) {
        // 用 ^ 替换字符串中的空格
        const val = Array.isArray(filterVal[mark]) ? array_format(filterVal[mark]) : stringify(filterVal[mark], '^');
        if (val === "''" || val === '[]') continue;
        __query__ += `${!showType ? property : `${property}|${type}`} ${mark} ${val} and `;
      }
    }
    __query__ = __query__.slice(0, -1 * cutStep);
  } else {
    let cutStep = 0;
    for (let i = 0, len = filters.length; i < len; i++) {
      const x = filters[i];
      if (!x.fieldName) continue;
      const val = Array.isArray(x.condition)
        ? array_format(x.condition)
        : stringify(x.fieldType === 'number' ? Number(x.condition) : x.condition, '^');
      __query__ += `${x.bracket_left} ${!showType ? x.fieldName : `${x.fieldName}|${x.fieldType}`} ${x.expression} ${val} ${x.bracket_right} ${
        x.logic
      } `;
      cutStep = x.logic.length;
    }
    __query__ = __query__.slice(0, -1 * cutStep - 2);
  }
  // console.log('where:', __query__);
  return __query__.replace(/\s+/g, ' ').trim();
};

// 多列分组聚合
export const groupBy = (array = [], props = []) => {
  const fn = (x) => {
    const res = [];
    props.forEach((k) => res.push(getCellValue(x, k)));
    return res;
  };
  const groups = {};
  array.forEach((x) => {
    const group = JSON.stringify(fn(x));
    groups[group] = groups[group] || [];
    groups[group].push(x);
  });
  return Object.keys(groups).map((group) => {
    return groups[group];
  });
};
