/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-25 10:00:17
 */
import { CSSProperties, defineComponent } from 'vue';
import { isEqual } from 'lodash-es';
import { JSXNode, Nullable } from '../../../_utils/types';
import { IColumn, IDerivedRowKey, ITableSize, IFetchParams, IRecord } from './types';

import baseProps from './props';
import Store from '../store';
import TableManager from '../manager';
import { isChrome, isIE, deepToRaw, noop } from '../../../_utils/util';
import { useSize } from '../../../hooks/useSize';
import { isEmpty } from '../../../_utils/util';
import { getScrollBarWidth } from '../../../_utils/scrollbar-width';
import { columnsFlatMap, convertToRows, getAllColumns, getAllTableData, createOrderBy, parseHeight } from '../utils';
import { warn } from '../../../_utils/error';
import config from '../config';

import columnsMixin from '../columns';
import expandableMixin from '../expandable/mixin';
import selectionMixin from '../selection/mixin';
import groupSubtotalMixin from '../group-subtotal';
import validateMixin from '../edit/validate';
import localStorageMixin from '../local-storage';
import layoutMethods from './layout-methods';
import coreMethods from './core-methods';
import interfaceMethods from './interface-methods';
import renderMethods from './render-table';

const EMITS: string[] = ['change', 'dataChange', 'dataLoaded'];

export default defineComponent({
  name: 'QmTable',
  componentName: 'QmTable',
  inheritAttrs: false,
  props: {
    ...baseProps,
  },
  provide() {
    return {
      $$table: this,
    };
  },
  mixins: [columnsMixin, expandableMixin, selectionMixin, groupSubtotalMixin, validateMixin, localStorageMixin],
  emits: EMITS,
  data() {
    Object.assign(this, {
      // 原始列
      originColumns: [],
      // 原始数据
      tableOriginData: [],
      // 选中的行记录
      selectionRows: [],
      // 高级检索的条件
      superFilters: [],
      // dom 节点集合
      elementStore: {},
      // 缓存数据
      allRowKeysMap: new Map(),
    });
    return {
      // 组件 store 仓库
      store: new Store(),
      // 渲染中的数据
      tableData: [],
      // 完整数据 - 重要
      tableFullData: [],
      // 表头筛选
      filters: {},
      // 表头排序
      sorter: {},
      // 服务端合计
      summaries: {},
      // 分页
      pagination: {
        currentPage: this.paginationConfig?.currentPage || config.pagination.currentPage,
        pageSize: this.paginationConfig?.pageSize || config.pagination.pageSize,
      },
      // 自适应的表格高度
      autoHeight: 0,
      // 记录总数
      total: 0,
      // 页面是否加载中
      showLoading: this.loading,
      // 是否存在横向滚动条
      scrollX: false,
      // 是否存在纵向滚动条
      scrollY: false,
      // 是否启用了纵向 Y 可视渲染方式加载
      scrollYLoad: false,
      // 存放纵向 Y 虚拟滚动相关信息
      scrollYStore: {
        startIndex: 0,
        endIndex: 0,
        offsetSize: 0,
        visibleSize: 0,
        rowHeight: 0,
      },
      // 表格布局相关参数
      layout: {
        // 滚动条宽度
        gutterWidth: getScrollBarWidth(),
        // 表格宽度
        tableWidth: 0,
        // 表格体宽度
        tableBodyWidth: 0,
        // 表格体内容高度
        tableBodyHeight: 0,
        // 表格体父容器（视口）高度
        viewportHeight: 0,
        // 头部高度
        headerHeight: 0,
        // 底部高度
        footerHeight: 0,
      },
      // 选择列，已选中行的 keys
      selectionKeys: this.rowSelection?.selectedRowKeys ?? [],
      // 行高亮，已选中的 key
      highlightKey: this.rowHighlight?.currentRowKey ?? '',
      // 已展开行的 keys
      rowExpandedKeys: this.expandable?.expandedRowKeys ?? [],
      // X 滚动条是否离开左边界
      isPingLeft: false,
      // X 滚动条是否离开右边界
      isPingRight: false,
      // 响应式变化的状态
      resizeState: {
        width: 0,
        height: 0,
      },
      // 是否是 IE11
      isIE: isIE(),
      // 全屏样式
      isFullScreen: false,
    };
  },
  computed: {
    $$tableBody() {
      return this.$refs[`tableBody`];
    },
    tableColumns(): IColumn[] {
      return this.createTableColumns(this.columns);
    },
    flattenColumns(): IColumn[] {
      return columnsFlatMap(this.tableColumns);
    },
    allColumns(): IColumn[] {
      return getAllColumns(this.tableColumns);
    },
    allTableData(): IRecord[] {
      return !this.isTreeTable ? this.tableFullData : getAllTableData(this.tableFullData);
    },
    allRowKeys(): string[] {
      return this.allTableData.map((row) => this.getRowKey(row, row.index));
    },
    deriveRowKeys(): IDerivedRowKey[] {
      return this.createDeriveRowKeys(this.tableFullData, null);
    },
    tableChange() {
      return [this.pagination, this.filters, this.sorter, { currentDataSource: [...this.tableFullData], allDataSource: [...this.tableOriginData] }];
    },
    leftFixedColumns(): IColumn[] {
      return this.flattenColumns.filter((column) => column.fixed === 'left');
    },
    rightFixedColumns(): IColumn[] {
      return this.flattenColumns.filter((column) => column.fixed === 'right');
    },
    showFooter(): boolean {
      return this.flattenColumns.some((x) => !!x.summation);
    },
    showPagination(): boolean {
      return this.isFetch || this.webPagination;
    },
    isGroup(): boolean {
      return convertToRows(this.tableColumns).length > 1;
    },
    isHeadSorter(): boolean {
      return this.flattenColumns.some((column) => column.sorter);
    },
    isHeadFilter(): boolean {
      return this.flattenColumns.some((column) => column.filter);
    },
    isServiceSummation(): boolean {
      return this.flattenColumns.some((x) => !!x.summation?.dataKey);
    },
    isSelectCollection(): boolean {
      return this.showSelectCollection && this.isFetch && this.rowSelection?.type === 'checkbox';
    },
    isSuperSearch(): boolean {
      return this.showSuperSearch && this.isHeadFilter;
    },
    isGroupSummary(): boolean {
      return this.flattenColumns.some((column) => !!column.groupSummary);
    },
    isGroupSubtotal(): boolean {
      return !!this.summation?.groupItems?.length;
    },
    isTreeTable(): boolean {
      return this.tableFullData.some((x) => Array.isArray(x.children) && x.children.length);
    },
    isTableEmpty(): boolean {
      return !this.tableData.length;
    },
    isFetch(): boolean {
      return !!this.fetch;
    },
    variableParams(): IFetchParams {
      const orderby = createOrderBy(this.sorter);
      const query = this.formatFiltersParams(this.filters, this.superFilters);
      const params = this.isFetch ? this.fetch.params : null;
      const sorter = orderby ? { [config.sorterFieldName]: orderby } : null;
      const filter = query.length ? { [config.filterFieldName]: query } : null;
      return {
        ...sorter,
        ...filter,
        ...params,
        ...this.pagination,
      };
    },
    fetchParams(): IFetchParams {
      return Object.assign({}, this.variableParams, this.createTableParams());
    },
    bordered(): boolean {
      return this.border || this.isGroup;
    },
    tableSize(): ITableSize {
      const { $size } = useSize(this.$props);
      return $size || 'default';
    },
    shouldUpdateHeight(): boolean {
      return this.height || this.maxHeight || this.isTableEmpty;
    },
    fullHeight(): Nullable<number> {
      const pagerHeight: number = this.showPagination ? 40 : 0;
      if (this.isFullScreen && this.shouldUpdateHeight) {
        return window.innerHeight - 30 - this.$refs[`topper`].offsetHeight - pagerHeight;
      }
      return null;
    },
    tableStyles(): CSSProperties {
      const { fullHeight, autoHeight } = this;
      const height = parseHeight(this.height);
      const minHeight = parseHeight(this.minHeight);
      const maxHeight = parseHeight(this.maxHeight);
      const result = {};
      if (minHeight) {
        Object.assign(result, { minHeight: `${minHeight}px` });
      }
      if (maxHeight) {
        Object.assign(result, { maxHeight: `${maxHeight}px` });
      }
      if (fullHeight) {
        return { ...result, height: `${fullHeight}px` };
      }
      if (height) {
        return { ...result, height: this.height !== 'auto' ? `${height}px` : `${autoHeight}px` };
      }
      return result;
    },
  },
  watch: {
    dataSource(next: IRecord[]): void {
      // 不能使用 prev，会导致数据直接 push 不更新的 bug
      if (isEqual(next, this.tableFullData)) return;
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
      this.createTableData(next);
    },
    tableFullData(): void {
      // 加载表格数据
      this.loadTableData().then(() => {
        this.doLayout();
      });
      // 触发 dataChange 事件
      this.dataChangeDebouncer();
    },
    columns(next: IColumn[]): void {
      this.setLocalColumns(next);
    },
    filters(): void {
      this.$emit('change', ...this.tableChange);
    },
    sorter(): void {
      this.$emit('change', ...this.tableChange);
    },
    allRowKeys(next: string[], prev: string[]): void {
      if (isEqual(next, prev)) return;
      this.allRowKeysMap.clear();
      next.forEach((x, i) => this.allRowKeysMap.set(x, i));
    },
    tableSize: {
      handler(next: string): void {
        this.scrollYStore.rowHeight = config.rowHeightMaps[next];
      },
      immediate: true,
    },
    pagination: {
      handler(): void {
        this.$emit('change', ...this.tableChange);
      },
      deep: true,
    },
    [`fetch.params`](): void {
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
    },
    variableParams(next: IFetchParams, prev: IFetchParams): void {
      const { clearableAfterFetched = !0 } = this.rowSelection || {};
      const isOnlyPageChange = this.onlyPaginationChange(next, prev);
      if (!isOnlyPageChange) {
        this.isFetch && clearableAfterFetched && this.clearRowSelection();
      }
      if (!isOnlyPageChange && next.currentPage > 1 && !this.fetch?.stopToFirst) {
        this.toFirstPage();
      } else {
        this.isFetch && this.getTableDataDebouncer();
      }
    },
    selectionKeys(next: string[], prev: string[]): void {
      if (!this.rowSelection || isEqual(next, prev)) return;
      const { onChange = noop } = this.rowSelection;
      // 设置选中的行数据
      this.selectionRows = this.createSelectionRows(next);
      onChange(next, this.selectionRows);
    },
    [`rowSelection.selectedRowKeys`](next: string[]): void {
      if (this.rowSelection.type === 'radio') {
        this.$$tableBody.setClickedValues(next.length ? [next[0], '__selection__'] : []);
      }
      this.selectionKeys = this.createSelectionKeys(next);
      if (this.isTreeTable) {
        this.rowExpandedKeys = this.createRowExpandedKeys();
      }
    },
    [`expandable.expandedRowKeys`](): void {
      this.rowExpandedKeys = this.createRowExpandedKeys();
    },
    [`treeStructure.expandedRowKeys`](): void {
      this.rowExpandedKeys = this.createRowExpandedKeys();
    },
    rowExpandedKeys(next: string[], prev: string[]): void {
      if (!this.expandable || isEqual(next, prev)) return;
      const { onChange = noop } = this.expandable;
      onChange(
        next,
        next.map((x) => this.allTableData[this.allRowKeys.findIndex((k) => k === x)])
      );
    },
    highlightKey(next: string): void {
      if (!this.rowHighlight) return;
      const { onChange = noop } = this.rowHighlight;
      onChange(next, this.allTableData[this.allRowKeys.findIndex((x) => x === next)] ?? null);
    },
    [`rowHighlight.currentRowKey`](next: string): void {
      this.$$tableBody.setClickedValues(!isEmpty(next) ? [next, 'index'] : []);
      this.highlightKey = this.rowHighlight?.currentRowKey ?? this.highlightKey;
    },
    [`layout.viewportHeight`](next: number): void {
      const { rowHeight, startIndex, endIndex } = this.scrollYStore;
      const visibleYSize = Math.max(8, Math.ceil(next / rowHeight) + 2);
      const offsetYSize = isChrome() ? 0 : 10;
      Object.assign(this.scrollYStore, {
        visibleSize: visibleYSize,
        offsetSize: offsetYSize,
        endIndex: Math.max(startIndex, visibleYSize + offsetYSize, endIndex),
      });
    },
    scrollYLoad(next: boolean): void {
      this.$nextTick(() => (!next ? this.updateScrollYSpace() : this.loadScrollYData(this.$$tableBody.prevST)));
    },
    scrollX(next: boolean): void {
      this.isPingRight = next;
    },
    loading(next: boolean): void {
      this.showLoading = next;
    },
  },
  created() {
    TableManager.register(this.getTableInstance().uid, this.getTableInstance());
    this.originColumns = deepToRaw(this.columns);
    this.createDebouncer();
    // 获取表格数据
    if (!this.isFetch) {
      this.createTableData(this.dataSource);
    } else {
      this.getTableDataDebouncer();
    }
    // 加载表格数据
    this.loadTableData().then(() => {
      this.doLayout();
    });
  },
  mounted() {
    this.setElementStore();
    this.doLayout();
    this.bindEvents();
    this.createResizeState();
  },
  activated() {
    TableManager.focus(this.getTableInstance().uid);
    this.scrollYLoad && this.loadScrollYData(0);
    this.calcTableHeight();
  },
  beforeUnmount() {
    TableManager.deregister(this.getTableInstance().uid);
    this.destroy();
  },
  methods: {
    ...coreMethods,
    ...layoutMethods,
    ...interfaceMethods,
    ...renderMethods,
    getRowKey(row: IRecord, index: number): string | number {
      const { rowKey } = this;
      const key: string | number = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (key === undefined) {
        warn('Table', 'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.');
        return index;
      }
      return key;
    },
  },
  render(): JSXNode {
    return this.renderTable();
  },
});
