/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 19:28:28
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-02-08 19:28:28
 */
import isServer from './isServer';

let scrollBarWidth: number;

export const getScrollBarWidth = (): number => {
  if (isServer) return 0;

  if (scrollBarWidth !== undefined) {
    return scrollBarWidth;
  }

  const outer = document.createElement('div');
  outer.className = 'el-scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode?.removeChild(outer);
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};
