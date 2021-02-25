/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 10:24:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-25 19:38:32
 */
import { transform, isEqual, isObject } from 'lodash-es';
import { Nullable } from '../../_utils/types';

export const noop = (): void => {};

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
