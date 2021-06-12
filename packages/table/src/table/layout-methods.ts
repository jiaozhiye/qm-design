/*
 * @Author: 焦质晔
 * @Date: 2020-02-29 22:17:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 15:42:59
 */
import addEventListener from 'add-dom-event-listener';
import { addResizeListener, removeResizeListener } from '../../../_utils/resize-event';
import { prevent } from '../../../_utils/dom';

export default {
  createResizeState(): void {
    const { offsetWidth, offsetHeight } = this.$vTable;
    this.resizeState = Object.assign({}, { width: offsetWidth, height: offsetHeight });
  },
  updateElsHeight(): void {
    const { tableHeader, tableFooter } = this.$refs;
    const tableOuterHeight = this.$vTable.offsetHeight;
    this.layout.headerHeight = (this.showHeader ? tableHeader?.$el.offsetHeight : 0) || 0;
    this.layout.footerHeight = (this.showFooter ? tableFooter?.$el.offsetHeight : 0) || 0;
    // body 可视区高度
    this.layout.viewportHeight = tableOuterHeight - this.layout.headerHeight - this.layout.footerHeight;
    this.layout.tableBodyHeight = this.$$tableBody.$el.querySelector('.qm-table--body').offsetHeight;
    this.scrollY = this.scrollYLoad || this.layout.tableBodyHeight > this.layout.viewportHeight;
  },
  resizeListener(): void {
    const { width: oldWidth, height: oldHeight } = this.resizeState;
    // X 方向
    const width = this.$vTable.offsetWidth;
    const isXChange = oldWidth !== width;
    // Y 方向
    const height = this.$vTable.offsetHeight;
    const isYChange = this.shouldUpdateHeight && oldHeight !== height;
    const shouldUpdateLayout = isXChange || isYChange;
    if (!shouldUpdateLayout) return;
    this.resizeState = { width, height };
    if (isYChange && this.scrollYLoad) {
      this.loadTableData();
    }
    this.doLayout();
  },
  calcTableHeight(ev: Event): void {
    ev && prevent(ev);
    if (this.height !== 'auto') return;
    const disY = this.showPagination ? 50 : 10;
    this.autoHeight = window.innerHeight - this.$vTable.getBoundingClientRect().top - disY;
    this.doLayout();
  },
  bindEvents(): void {
    addResizeListener(this.$vTable, this.resizeListener);
    if (this.height !== 'auto') return;
    this.resizeEvent = addEventListener(window, 'resize', this.calcTableHeight);
    this.calcTableHeight();
  },
  removeEvents(): void {
    removeResizeListener(this.$vTable, this.resizeListener);
    this.resizeEvent?.remove();
  },
  doLayout(): void {
    this.updateElsHeight();
    this.updateColumnsWidth();
    this.$nextTick(() => this.updateElsHeight());
  },
};
