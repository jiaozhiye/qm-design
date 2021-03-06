/*
 * @Author: 焦质晔
 * @Date: 2020-03-01 15:20:02
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-25 09:41:56
 */
import { ComponentInternalInstance } from 'vue';
import { get, isFunction, isObject } from 'lodash-es';
import { difference, hasOwn, debounce, getCellValue, setCellValue } from '../utils';
import { deepToRaw, errorCapture, noop } from '../../../_utils/util';
import { warn } from '../../../_utils/error';
import config from '../config';
import { IRecord, ISuperFilter, IDerivedRowKey, IColumn, ICellSpan } from './types';

export default {
  // 创建表格数据
  createTableData(list: IRecord[]): void {
    const resetRowData = (arr: IRecord[]): IRecord[] => {
      return arr.map((record, index) => {
        if (Array.isArray(record.children) && record.children.length) {
          record.children = resetRowData(record.children);
        }
        // 数据索引
        record.index = index;
        // 分页索引
        record.pageIndex = this.createPageIndex(index);
        return record;
      });
    };
    const results: IRecord[] = this.createGroupData(resetRowData(list));
    // 设置表格数据
    this.tableFullData = [...results];
    this.tableOriginData = [...results];
    // 行选中 & 自动获得焦点
    this.initialTable();
    this.dataLoadedHandle();
  },
  // 表格初始化
  initialTable(): void {
    this.$nextTick(() => {
      // 设置选择列
      this.selectionKeys = this.createSelectionKeys();
      // 设置展开行
      this.rowExpandedKeys = this.createRowExpandedKeys();
      this.selectFirstRow();
      this.$$tableBody.createInputFocus();
      this.$$tableBody.resetTableBodyScroll();
    });
  },
  // 服务端合计
  createSummation(data: Record<string, any>): void {
    if (!this.isServiceSummation) return;
    const { summation = {} } = this;
    const dataKey = summation.fetch?.dataKey ?? config.summationKey;
    const summationData = (dataKey ? get(data, dataKey) : data) ?? {};
    this.flattenColumns
      .filter((x) => !!x.summation?.dataKey)
      .forEach((x) => {
        setCellValue(this.summaries, x.dataIndex, Number(getCellValue(summationData, x.summation.dataKey)));
      });
  },
  // 表格的查询参数
  createTableParams(): Record<string, any> {
    const params = {};
    if (this.isServiceSummation) {
      Object.assign(params, { [config.groupSummary.summaryFieldName]: this.createColumnSummary(), usedJH: 1 });
    }
    return params;
  },
  // ajax 获取数据
  async getTableData(): Promise<void> {
    const { summation, fetch, fetchParams } = this;
    if (!fetch) return;
    const { beforeFetch = () => !0, xhrAbort = !1 } = fetch;
    if (!beforeFetch(fetchParams) || xhrAbort) return;
    // 是否为单独的合计接口
    const isSummationFetch = !!summation?.fetch;
    console.log(`ajax 请求参数：`, fetchParams);
    this.showLoading = true;
    try {
      const [res, sum] = !isSummationFetch
        ? [await fetch.api(fetchParams)]
        : await Promise.all([fetch.api(fetchParams), summation.fetch.api(fetchParams)]);
      const isSuccess = !isSummationFetch ? res.code === 200 : res.code === 200 && sum.code === 200;
      if (isSuccess) {
        const datakey = fetch.dataKey ?? config.dataKey;
        const items = get(res.data, datakey) ?? [];
        const total = get(res.data, datakey.replace(/[^.]+$/, config.totalKey)) || items.length || 0;
        const [err, bool = !0] = await errorCapture(this.beforeLoadTable || noop, items);
        if (!err && bool) {
          this.createTableData(items);
          this.setRecordsTotal(total);
          this.createSummation(!isSummationFetch ? res.data : sum.data);
          fetch.callback?.(res.data);
        }
      }
    } catch (err) {
      // 请求超时
      this.dataLoadedHandle();
    }
    if (hasOwn(this.fetch, 'stopToFirst')) {
      this.fetch.stopToFirst = false;
    }
    this.showLoading = false;
  },
  // 加载表格数据
  loadTableData(): Promise<void> {
    const { height, maxHeight, ellipsis } = this;

    // 是否开启虚拟滚动
    this.scrollYLoad = this.createScrollYLoad();

    if (this.scrollYLoad) {
      if (!(height || maxHeight)) {
        warn('Table', '必须设置组件参数 `height` 或 `maxHeight`');
      }
      if (!ellipsis) {
        warn('Table', '必须设置组件参数 `ellipsis`');
      }
    }

    this.handleTableData();
    !this.isFetch && this.setRecordsTotal();

    return this.computeScrollLoad();
  },
  // 获取表格数据
  createTableList(): IRecord[] {
    return !this.webPagination ? this.tableFullData : this.createPageData();
  },
  // 设置是否开启虚拟滚动
  createScrollYLoad(): boolean {
    return this.createTableList().length > config.virtualScrollY;
  },
  // 创建分页索引
  createPageIndex(index: number): number {
    return !this.isFetch ? index : (this.pagination.currentPage - 1) * this.pagination.pageSize + index;
  },
  // 设置数据总数
  setRecordsTotal(total: number): void {
    this.total = typeof total === 'undefined' ? this.tableFullData.length : total;
  },
  // 处理渲染数据
  handleTableData(): void {
    const { scrollYLoad, scrollYStore } = this;
    const dataList = this.createTableList();
    // 处理显示数据
    this.tableData = scrollYLoad ? dataList.slice(scrollYStore.startIndex, scrollYStore.endIndex) : dataList;
  },
  // 纵向 Y 可视渲染事件处理
  triggerScrollYEvent(ev: Event): void {
    const target = ev.target as HTMLElement;
    if (!target) return;
    this.loadScrollYData(target.scrollTop);
  },
  // 纵向 Y 可视渲染处理
  loadScrollYData(scrollTop = 0): void {
    const { scrollYStore } = this;
    const { startIndex, endIndex, offsetSize, visibleSize, rowHeight } = scrollYStore;

    const toVisibleIndex = Math.floor(scrollTop / rowHeight);
    const offsetStartIndex = Math.max(0, toVisibleIndex - 1 - offsetSize);
    const offsetEndIndex = toVisibleIndex + visibleSize + offsetSize;

    if (toVisibleIndex <= startIndex || toVisibleIndex >= endIndex - visibleSize - 1) {
      if (startIndex !== offsetStartIndex || endIndex !== offsetEndIndex) {
        scrollYStore.startIndex = offsetStartIndex;
        scrollYStore.endIndex = offsetEndIndex;
        this.updateScrollYData();
      }
    }
  },
  // 更新纵向 Y 可视渲染上下剩余空间大小
  updateScrollYSpace(): void {
    const { scrollYLoad, scrollYStore, elementStore } = this;
    const { startIndex, rowHeight } = scrollYStore;
    const dataList = this.createTableList();

    let marginTop = '';
    let ySpaceHeight = '';

    if (scrollYLoad) {
      marginTop = Math.max(0, startIndex * rowHeight) + 'px';
      ySpaceHeight = dataList.length * rowHeight + 'px';
    }

    elementStore[`$tableBody`].style.transform = marginTop ? `translateY(${marginTop})` : marginTop;
    elementStore[`$tableYspace`].style.height = ySpaceHeight;
  },
  // 更新 Y 方向数据
  updateScrollYData(): void {
    this.handleTableData();
    this.updateScrollYSpace();
  },
  // 计算可视渲染相关数据
  computeScrollLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.scrollYLoad) {
        // 不是虚拟滚动
        resolve();
      } else if (this.scrollYStore.visibleSize) {
        resolve();
        this.updateScrollYData();
      } else {
        this.$nextTick(() => {
          resolve();
          this.updateScrollYData();
        });
      }
    });
  },
  // 表格单元格合并
  getSpan(row: IRecord, column: IColumn, rowIndex: number, columnIndex: number, tableData: IRecord[]): ICellSpan {
    let rowspan = 1;
    let colspan = 1;
    const fn = this.spanMethod;
    if (isFunction(fn)) {
      const result = fn({ row, column, rowIndex, columnIndex, tableData });
      if (Array.isArray(result)) {
        rowspan = result[0];
        colspan = result[1];
      } else if (isObject(result)) {
        rowspan = result.rowspan;
        colspan = result.colspan;
      }
    }
    return { rowspan, colspan };
  },
  // 格式化 表头筛选 和 高级检索 参数
  formatFiltersParams(filters, superFilters): ISuperFilter[] {
    const result: ISuperFilter[] = [];
    // 表头筛选
    if (Object.keys(filters).length) {
      for (const key in filters) {
        const type = config.showFilterType ? key.split('|')[0] : '';
        const fieldName = config.showFilterType ? key.split('|')[1] : key;
        const target = filters[key];
        Object.keys(target).forEach((k) => {
          result.push({
            type,
            bracketLeft: '',
            fieldName,
            expression: k,
            value: target[k],
            bracketRright: '',
            logic: 'and',
          });
        });
      }
    }
    // 高级检索
    if (superFilters.length) {
      superFilters.forEach((x) => {
        result.push({
          type: config.showFilterType ? x.fieldType : '', // 筛选器类型
          bracketLeft: x.bracket_left, // 左括号
          fieldName: x.fieldName, // 字段名
          expression: x.expression, // 运算符号
          value: x.condition, // 值
          bracketRright: x.bracket_right, // 右括号
          logic: x.logic, // 逻辑符号
        });
      });
    }
    // 移除最后的 逻辑符号
    if (result.length) {
      result[result.length - 1].logic = '';
    }
    return deepToRaw(result);
  },
  // 创建派生的 rowKeys for treeTable
  createDeriveRowKeys(tableData: IRecord[], key: string): IDerivedRowKey[] {
    return tableData.map((row) => {
      const rowKey = this.getRowKey(row, row.index);
      const item: IDerivedRowKey = { rowKey };
      if (row.children) {
        item.children = this.createDeriveRowKeys(row.children, rowKey);
      }
      return key ? Object.assign({}, item, { parentRowKey: key }) : item;
    });
  },
  // 获取所有后代节点 rowKeys
  getAllChildRowKeys(deriveRowKeys): string[] {
    const results: string[] = [];
    for (let i = 0; i < deriveRowKeys.length; i++) {
      if (Array.isArray(deriveRowKeys[i].children)) {
        results.push(...this.getAllChildRowKeys(deriveRowKeys[i].children));
      }
      results.push(deriveRowKeys[i].rowKey);
    }
    return results;
  },
  // 获取祖先节点 rowKeys
  findParentRowKeys(deriveRowKeys, key): string[] {
    const results: string[] = [];
    deriveRowKeys.forEach((x) => {
      if (x.children) {
        results.push(...this.findParentRowKeys(x.children, key));
      }
      if (x.rowKey === key && x.parentRowKey) {
        results.push(x.parentRowKey);
      }
    });
    if (results.length) {
      results.push(...this.findParentRowKeys(deriveRowKeys, results[results.length - 1]));
    }
    return results;
  },
  // 数据加载事件
  dataLoadedHandle(): void {
    this.$emit('dataLoaded', [...this.tableFullData]);
  },
  // 数据变化事件
  dataChangeHandle(): void {
    this.$emit('dataChange', [...this.tableFullData]);
  },
  // 分页事件
  pagerChangeHandle({ currentPage, pageSize }): void {
    this.pagination.currentPage = currentPage;
    this.pagination.pageSize = pageSize;
    if (!this.webPagination) return;
    // 在内存分页模式下，分页改变时，加载数据
    this.loadTableData();
    this.$$tableBody.resetTableBodyScroll();
  },
  // 创建内存分页的列表数据
  createPageData(): IRecord[] {
    const { currentPage, pageSize } = this.pagination;
    return this.tableFullData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  },
  // 设置高级检索的条件
  createSuperSearch(val): void {
    this.superFilters = val;
  },
  // 设置列汇总条件
  createColumnSummary(): string {
    return this.flattenColumns
      .filter((x) => x.summation?.dataKey)
      .map((x) => `sum|${x.dataIndex}`)
      .join(',');
  },
  // 是否仅有分页参数产生变化
  onlyPaginationChange(next, prev): boolean {
    const diff = Object.keys(difference(next, prev));
    return diff.length === 1 && (diff.includes('currentPage') || diff.includes('pageSize'));
  },
  // 默认选中首行数据
  selectFirstRow(bool?: boolean): void {
    const { rowSelection, tableFullData } = this;
    const { type, defaultSelectFirstRow } = rowSelection || {};
    const isSelectFirstRow: boolean = defaultSelectFirstRow || bool || false;
    if (type !== 'radio' || !isSelectFirstRow || !tableFullData.length) return;
    const rowKey = this.getRowKey(tableFullData[0], tableFullData[0].index);
    this.$$tableBody.setClickedValues([rowKey, '__selection__']);
    this.selectionKeys = [rowKey];
  },
  // 获取组件实例
  getTableInstance(): ComponentInternalInstance {
    const { _: instance } = this;
    return instance;
  },
  // 返回到第一页
  toFirstPage(): void {
    this.pagerChangeHandle({ ...this.pagination, currentPage: 1 });
  },
  // 前往最后一页
  toLastPage(): void {
    const { currentPage, pageSize } = this.pagination;
    const pageCount: number = Math.ceil(this.total / pageSize);
    if (!this.webPagination || currentPage >= pageCount) return;
    this.pagerChangeHandle({ currentPage: pageCount, pageSize });
  },
  // 创建 debouncer
  createDebouncer() {
    this.getTableDataDebouncer = debounce(this.getTableData);
    this.dataChangeDebouncer = debounce(this.dataChangeHandle);
  },
  // 清空列选中
  clearRowSelection(): void {
    if (!this.selectionKeys.length) return;
    this.selectionKeys = [];
  },
  // 清空行高亮
  clearRowHighlight(): void {
    this.highlightKey = '';
  },
  // 清空表头排序
  clearTableSorter(): void {
    this.$refs[`tableHeader`]?.clearTheadSorter();
  },
  // 清空表头筛选
  clearTableFilter(): void {
    this.$refs[`tableHeader`]?.clearTheadFilter();
  },
  // 清空高级检索的条件
  clearSuperSearch(): void {
    this.createSuperSearch([]);
  },
  // 清空表格各种操作记录
  clearTableLog(): void {
    this.store.clearAllLog();
  },
  // 移除选择列数据
  removeSelectionKey(rowKey: string): void {
    this.selectionKeys = this.selectionKeys.filter((x) => x !== rowKey);
  },
  // 移除展开行数据
  removeExpandableKey(rowKey: string): void {
    this.rowExpandedKeys = this.rowExpandedKeys.filter((x) => x !== rowKey);
  },
  // 析构方法
  destroy(): void {
    this.removeEvents();
    this.store.destroy();
  },
};
