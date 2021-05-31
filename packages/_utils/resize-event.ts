/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:25
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-31 09:23:42
 */
import ResizeObserver from 'resize-observer-polyfill';
import isServer from './isServer';
import { CustomHTMLElement, AnyFunction } from './types';

export type ResizableElement = CustomHTMLElement<{
  __resizeListeners__: Array<AnyFunction<void>>;
  __ro__: ResizeObserver;
}>;

const resizeHandler = function (entries: ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const listeners = (entry.target as ResizableElement).__resizeListeners__ || [];
    if (listeners.length) {
      listeners.forEach((fn) => fn());
    }
  }
};

export const addResizeListener = function (element: ResizableElement, fn: AnyFunction<void>): void {
  if (isServer || !element) return;
  if (!element.__resizeListeners__) {
    element.__resizeListeners__ = [];
    element.__ro__ = new ResizeObserver(resizeHandler);
    element.__ro__.observe(element);
  }
  element.__resizeListeners__.push(fn);
};

export const removeResizeListener = function (element: ResizableElement, fn: AnyFunction<void>): void {
  if (!element || !element.__resizeListeners__) return;
  element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
  if (!element.__resizeListeners__.length) {
    element.__ro__.disconnect();
  }
};
