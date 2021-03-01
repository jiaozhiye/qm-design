/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:31
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-01 15:15:09
 */
import { Ref, Fragment, Comment, Text } from 'vue';
import { isObject, isArray, hasOwn, camelize } from '@vue/shared';
import { isNumber, debounce, throttle } from 'lodash-es';
import isServer from './isServer';
import { AnyFunction, AnyObject } from './types';

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

export const isEmptyElement = (c): boolean => {
  return (
    c.type === Comment ||
    (c.type === Fragment && c.children.length === 0) ||
    (c.type === Text && c.children.trim() === '')
  );
};

export const isValidElement = (c): boolean => {
  return c && c.__v_isVNode && typeof c.type !== 'symbol'; // remove text node
};

export { hasOwn, camelize };

export const noop = (): void => {};

// 函数的 防抖 和 节流，使用 lodash 工具函数
export { debounce, throttle };

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

export const isValid = (val: string): boolean => {
  return val !== undefined && val !== null && val !== '';
};

export const getValueByPath = (obj: AnyObject<any>, paths = ''): unknown => {
  let ret = obj;
  paths.split('.').map((path) => {
    ret = ret?.[path];
  });
  return ret;
};

export const getParserWidth = (val: number | string): string => {
  if (isNumber(val)) {
    return `${val}px`;
  }
  return val.toString();
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

export const initDefaultProps = <T extends AnyObject<any>>(
  propTypes: T,
  defaultProps: {
    [P in keyof T]: T[P];
  }
): T => {
  Object.keys(defaultProps).forEach((k) => {
    if (propTypes[k]) {
      propTypes[k].def && ((propTypes[k] as any) = propTypes[k].def(defaultProps[k]));
    } else {
      throw new Error(`not have ${k} prop`);
    }
  });
  return propTypes;
};
