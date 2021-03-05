/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-05 10:28:14
 */
import { camelize, isObject } from '@vue/shared';
import isServer from './isServer';
import { Nullable } from './types';

/* istanbul ignore next */
export const on = (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListener,
  useCapture = false
): void => {
  if (element && event && handler) {
    element.addEventListener(event, handler, useCapture);
  }
};

/* istanbul ignore next */
export const off = (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListener,
  useCapture = false
): void => {
  if (element && event && handler) {
    element.removeEventListener(event, handler, useCapture);
  }
};

export const stop = (e: Event): void => e.stopPropagation();

export const prevent = (e: Event): void => e.preventDefault();

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

/* istanbul ignore next */
export const setStyle = (
  element: HTMLElement,
  styleName: CSSStyleDeclaration | string,
  value?: string
): void => {
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

export const removeStyle = (element: HTMLElement, style: CSSStyleDeclaration | string): void => {
  if (isServer || !element || !style) return;

  if (isObject(style)) {
    Object.keys(style).forEach((prop) => {
      setStyle(element, prop, '');
    });
  } else {
    setStyle(element, style, '');
  }
};

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

export const getOffsetTop = (el: HTMLElement): number => {
  let offset = 0;
  let parent = el;

  while (parent) {
    offset += parent.offsetTop;
    parent = parent.offsetParent as HTMLElement;
  }

  return offset;
};

export const getOffsetTopDistance = (el: HTMLElement, containerEl: HTMLElement): number => {
  return Math.abs(getOffsetTop(el) - getOffsetTop(containerEl));
};

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
  let node = el;

  while (node) {
    if (node.classList.contains(selector)) {
      return node;
    }
    node = node.parentNode as HTMLElement;
  }

  return null;
};

// 判断元素是否为目标元素的后代
export const contains = (rootElement: HTMLElement, targetElement: HTMLElement): boolean => {
  let node = targetElement;

  while (node) {
    if (node === rootElement) {
      return true;
    }
    node = node.parentNode as HTMLElement;
  }

  return false;
};
