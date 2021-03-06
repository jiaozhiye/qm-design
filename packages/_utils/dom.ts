/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-06 08:19:36
 */
import { camelize, isObject } from '@vue/shared';
import isServer from './isServer';
import { Nullable } from './types';

// 事件绑定
export const on = (element: HTMLElement | Document | Window, event: string, handler: EventListener, useCapture = false): void => {
  if (element && event && handler) {
    element.addEventListener(event, handler, useCapture);
  }
};

// 事件解绑
export const off = (element: HTMLElement | Document | Window, event: string, handler: EventListener, useCapture = false): void => {
  if (element && event && handler) {
    element.removeEventListener(event, handler, useCapture);
  }
};

// 阻止事件冒泡
export const stop = (e: Event): void => e.stopPropagation();

// 阻止默认行为
export const prevent = (e: Event): void => e.preventDefault();

/**
 * @description 获取元素样式
 * @param {HTMLNode} element 元素节点
 * @param {string} styleName css 属性名称
 * @returns css 样式的值
 */
export const getStyle = (element: HTMLElement, styleName: string): Nullable<string> => {
  if (isServer || !element || !styleName) {
    return null;
  }
  styleName = camelize(styleName);
  if (styleName === 'float') {
    styleName = 'cssFloat';
  }
  try {
    const style = element.style[styleName];
    if (style) return style;
    const computed = document.defaultView.getComputedStyle(element, '');
    return computed ? computed[styleName] : '';
  } catch (e) {
    return element.style[styleName];
  }
};

/**
 * @description 设置元素样式
 * @param {HTMLNode} element 元素节点
 * @param {string} styleName css 属性名称
 * @param {string} value css 属性的值
 * @returns
 */
export const setStyle = (element: HTMLElement, styleName: CSSStyleDeclaration | string, value?: string): void => {
  if (isServer || !element || !styleName) return;
  if (isObject(styleName)) {
    Object.keys(styleName).forEach((prop) => {
      setStyle(element, prop, styleName[prop]);
    });
  } else {
    styleName = camelize(styleName);
    element.style[styleName] = value;
  }
};

/**
 * @description 移除元素样式
 * @param {HTMLNode} element 元素节点
 * @param {string} styleName css 属性名称
 * @returns
 */
export const removeStyle = (element: HTMLElement, styleName: CSSStyleDeclaration | string): void => {
  if (isServer || !element || !styleName) return;
  if (isObject(styleName)) {
    Object.keys(styleName).forEach((prop) => {
      setStyle(element, prop, '');
    });
  } else {
    setStyle(element, styleName, '');
  }
};

/**
 * @description 判断目标元素在坐标上，是否在参考节点里边
 * @param {HTMLNode} el 目标节点
 * @param {HTMLNode} container 参考节点
 * @returns boolean
 */
export const isInContainer = (el: HTMLElement, container: HTMLElement): boolean => {
  if (isServer || !el || !container) return false;
  const elRect = el.getBoundingClientRect();
  let containerRect: Partial<DOMRect>;
  if ([window, document, document.documentElement, null, undefined].includes(container)) {
    containerRect = {
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      left: 0,
    };
  } else {
    containerRect = container.getBoundingClientRect();
  }
  return (
    elRect.top < (containerRect.bottom as number) &&
    elRect.bottom > (containerRect.top as number) &&
    elRect.right > (containerRect.left as number) &&
    elRect.left < (containerRect.right as number)
  );
};

/**
 * @description 获取元素距离窗口顶部的上边距
 * @param {HTMLNode} el 元素节点
 * @returns 上边距的值
 */
export const getOffsetTop = (el: HTMLElement): number => {
  let offset = 0;
  let parent = el;

  while (parent) {
    offset += parent.offsetTop;
    parent = parent.offsetParent as HTMLElement;
  }

  return offset;
};

/**
 * @description 获取目标元素距离参考节点的上边距
 * @param {HTMLNode} el 目标节点
 * @param {HTMLNode} container 参考节点
 * @returns 上边距的值
 */
export const getOffsetTopDistance = (el: HTMLElement, container: HTMLElement): number => {
  return Math.abs(getOffsetTop(el) - getOffsetTop(container));
};

/**
 * @description 获取元素距离窗口的横纵坐标
 * @param {HTMLNode} el 目标节点
 * @returns 横纵坐标的值
 */
export const getPosition = (el: HTMLElement): Record<'x' | 'y', number> => {
  let xPosition = 0;
  let yPosition = 0;

  while (el) {
    xPosition += el.offsetLeft - el.scrollLeft + el.clientLeft;
    yPosition += el.offsetTop - el.scrollTop + el.clientTop;
    el = el.offsetParent as HTMLElement;
  }

  return { x: xPosition, y: yPosition };
};

/**
 * @description 获取满足条件的祖先元素
 * @param {HTMLNode} el 参考节点
 * @param {string} selector 目标节点 classname
 * @returns 满足条件的祖先元素
 */
export const getParentNode = (el: HTMLElement, selector: string): Nullable<HTMLElement> => {
  let parent = el;

  while (parent) {
    if (parent.classList.contains(selector)) {
      return parent;
    }
    parent = parent.parentNode as HTMLElement;
  }

  return null;
};

/**
 * @description 判断目标元素是否为参考节点的后代
 * @param {HTMLNode} el 目标元素
 * @param {HTMLNode} container 目标节点
 * @returns boolean
 */
export const contains = (container: HTMLElement, el: HTMLElement): boolean => {
  if (isServer || !el || !container) return false;
  let parent = el;

  while (parent) {
    if (parent === container) {
      return true;
    }
    parent = parent.parentNode as HTMLElement;
  }

  return false;
};
