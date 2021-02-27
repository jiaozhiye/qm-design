/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 10:24:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 12:36:02
 */
import { transform, isEqual, isObject } from 'lodash-es';
import dayjs from 'dayjs';
import { AnyObject, Nullable } from '../../_utils/types';

export const noop = (): void => {};

// 转日期对象
export const toDate = (val: string | string[]): Date | Date[] => {
  const vals: string[] = Array.isArray(val) ? val : [val];
  const result: Date[] = vals.map((x) => {
    return x ? dayjs(x).toDate() : undefined;
  });
  return Array.isArray(val) ? result : result[0];
};

// 转日期格式
export const dateFormat = (val: Date | Date[], vf: string): string | string[] => {
  const vals: Date[] = Array.isArray(val) ? val : [val];
  const result: string[] = vals.map((x) => {
    return x ? dayjs(x).format(vf) : undefined;
  });
  return Array.isArray(val) ? result : result[0];
};

// 设置日期控件的禁用状态
export const setDisabledDate = (oDate: Date, [minDateTime, maxDateTime]): boolean => {
  const min = minDateTime ? dayjs(minDateTime).toDate().getTime() : 0;
  const max = maxDateTime ? dayjs(maxDateTime).toDate().getTime() : 0;
  if (min && max) {
    return !(oDate.getTime() >= min && oDate.getTime() <= max);
  }
  if (min) {
    return oDate.getTime() < min;
  }
  if (max) {
    return oDate.getTime() > max;
  }
  return false;
};

// 数值类型格式化
export const formatNumber = (value = ''): string => {
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

// 表单字段值加密
export const secretFormat = (value = '', type: string): string => {
  value += '';
  if (type === 'finance') {
    value = formatNumber(value);
  }
  if (type === 'name') {
    value = value.replace(/^([\u4e00-\u9fa5]{1}).+$/, '$1**');
  }
  if (type === 'phone') {
    value = value.replace(/^(\d{3}).+(\d{4})$/, '$1****$2');
  }
  if (type === 'IDnumber') {
    value = value.replace(/^(\d{3}).+(\w{4})$/, '$1***********$2');
  }
  return value;
};

export const difference = (object: unknown, base: unknown): any => {
  return transform(object, (result, value, key) => {
    if (!isEqual(value ?? '', base[key] ?? '')) {
      result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
    }
  });
};

export const deepFind = (arr: any[], mark: unknown): Nullable<any> => {
  let res = null;
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i].children)) {
      res = deepFind(arr[i].children, mark);
    }
    if (res) {
      return res;
    }
    if (arr[i].value === mark) {
      return arr[i];
    }
  }
  return res;
};

export const deepMapList = (list: any[], valueKey: string, textKey: string): any[] => {
  return list.map((x) => {
    const item: AnyObject<any> = { value: x[valueKey], text: x[textKey] };
    x.disabled && (item.disabled = true);
    if (Array.isArray(x.children)) {
      item.children = deepMapList(x.children, valueKey, textKey);
    }
    return item;
  });
};

export const deepFindValues = (arr: any[], str: string, depth = 0): any[] => {
  const result = [];
  arr.forEach((x) => {
    if (x.value == str.split(',')[depth]) {
      result.push(x);
    }
    if (Array.isArray(x.children)) {
      result.push(...deepFindValues(x.children, str, depth + 1));
    }
  });
  return result;
};

export const deppGetPath = (arr: any[], value): any[] | undefined => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value == value) {
      return [value];
    }
    if (Array.isArray(arr[i].children)) {
      const temp = deppGetPath(arr[i].children, value);
      if (temp) {
        return [arr[i].value, temp].flat();
      }
    }
  }
};
