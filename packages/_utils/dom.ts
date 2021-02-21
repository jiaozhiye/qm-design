/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 09:19:38
 */
import { camelize } from '@vue/shared';
import isServer from './isServer';
import { Nullable } from './types';

/* istanbul ignore next */
export const on = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element.addEventListener(event, handler, useCapture);
  }
};

/* istanbul ignore next */
export const off = function (
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
  useCapture = false
): void {
  if (element && event && handler) {
    element.removeEventListener(event, handler, useCapture);
  }
};

/* istanbul ignore next */
export const once = function (el: HTMLElement, event: string, fn: EventListener): void {
  const listener = function (...args: unknown[]) {
    if (fn) {
      fn.apply(this, args);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

export const stop = (e: Event): void => e.stopPropagation();

export const prevent = (e: Event): void => e.preventDefault();

export const getStyle = (element: HTMLElement, styleName: string): string => {
  if (isServer) return;
  if (!element || !styleName) return null;
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
    elRect.top < containerRect.bottom &&
    elRect.bottom > containerRect.top &&
    elRect.right > containerRect.left &&
    elRect.left < containerRect.right
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

/**
 * Determine if a DOM element matches a CSS selector
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */
export const matches = (element: HTMLElement, selector: string): boolean => {
  // Vendor-specific implementations of `Element.prototype.matches()`.
  const proto = window.Element.prototype;
  const nativeMatches = proto.matches || proto.webkitMatchesSelector;

  if (!element || element.nodeType !== 1) {
    return false;
  }

  const parentElem = element.parentNode;

  // use native 'matches'
  if (nativeMatches) {
    return nativeMatches.call(element, selector);
  }

  // native support for `matches` is missing and a fallback is required
  const nodes = parentElem.querySelectorAll(selector);
  const len: number = nodes.length;

  for (let i = 0; i < len; i++) {
    if (nodes[i] === element) {
      return true;
    }
  }

  return false;
};

/**
 * @param element {Element}
 * @param selector {String}
 * @param context {Element=}
 * @return {Element}
 */
export const closest = (
  element: HTMLElement,
  selector: string,
  context: HTMLElement
): HTMLElement => {
  context = (context || document) as HTMLElement;
  while (element && element !== context) {
    if (matches(element, selector)) {
      return element;
    }
    element = element.parentNode as HTMLElement;
  }
};
