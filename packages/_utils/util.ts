/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:31
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-14 14:27:46
 */
import { getCurrentInstance } from 'vue';
import { isObject, isArray, hasOwn, camelize } from '@vue/shared';
import isServer from './isServer';
import type { Ref } from 'vue';
import { AnyFunction } from './types';

export const isIE = (): boolean => {
  return !isServer && !isNaN(Number(document.DOCUMENT_NODE));
};

export const isEdge = (): boolean => {
  return !isServer && navigator.userAgent.indexOf('Edge') > -1;
};

export const isChrome = (): boolean => {
  return !isServer && /chrome\/\d+/.test(navigator.userAgent) && !isEdge();
};

export const isFirefox = (): boolean => {
  return !isServer && !!navigator.userAgent.match(/firefox/i);
};

export { isVNode } from 'vue';

export { hasOwn, camelize };

export const useGlobalConfig = (): unknown => {
  const vm: any = getCurrentInstance();
  if ('$DESIGN' in vm.proxy) {
    return vm.proxy.$DESIGN;
  }
  return {};
};

export const isEmpty = (val: unknown): boolean => {
  if (
    (!val && val !== 0) ||
    (isArray(val) && !val.length) ||
    (isObject(val) && !Object.keys(val).length)
  ) {
    return true;
  }
  return false;
};

export const isValid = (val: unknown): boolean => {
  return val !== undefined && val !== null && val !== '';
};

export const getValueByPath = (obj: unknown, paths = ''): unknown => {
  let ret = obj;
  paths.split('.').map((path) => {
    ret = ret?.[path];
  });
  return ret;
};

/**
 * Unwraps refed value
 * @param ref Refed value
 */
export const $ = <T>(ref: Ref<T>): unknown => {
  return ref.value;
};

/**
 * @description 延迟方法，异步函数
 * @param {number} delay 延迟的时间，单位 毫秒
 * @returns
 */
export const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * @description 捕获基于 Promise 操作的异常
 * @param {func} asyncFn 异步函数
 * @param {any} params 函数的参数
 * @returns {array} 错误前置
 */
export const errorCapture = async (asyncFn: AnyFunction<any>, ...params: any[]): Promise<any[]> => {
  try {
    const res = await asyncFn(...params);
    return [null, res];
  } catch (e) {
    return [e, null];
  }
};

/**
 * @description 文件下载
 * @param {Blob} blob 对象
 * @param {string} fileName 文件名
 * @returns
 */
export const download = (blob: Blob, fileName: string): void => {
  // ie10+
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, decodeURI(fileName));
  } else {
    const downloadUrl: string = window.URL.createObjectURL(blob);
    let a: HTMLAnchorElement = document.createElement('a');
    a.href = downloadUrl;
    a.download = decodeURI(fileName);
    a.click();
    a = null;
  }
};

export const initDefaultProps = (propTypes: unknown, defaultProps: unknown): unknown => {
  Object.keys(defaultProps).forEach((k) => {
    if (propTypes[k]) {
      propTypes[k].def && (propTypes[k] = propTypes[k].def(defaultProps[k]));
    } else {
      throw new Error(`not have ${k} prop`);
    }
  });
  return propTypes;
};
