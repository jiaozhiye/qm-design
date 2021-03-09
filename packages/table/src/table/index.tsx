/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-09 08:11:50
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';

import baseProps from './props';
import Store from '../store';
import { isEqual } from 'lodash-es';
import { isChrome, isIE, noop } from '../../../_utils/util';
import { useSize } from '../../../hooks/useSize';

import { debounce, isEmpty } from '../../../_utils/util';
import { getScrollBarWidth } from '../../../_utils/scrollbar-width';
import { warn } from '../../../_utils/error';
import { columnsFlatMap, getAllColumns, getAllRowKeys, tableDataFlatMap, createOrderBy, createWhereSQL, parseHeight } from '../utils';
import config from '../config';

import columnsMixin from '../columns';
import expandableMixin from '../expandable/mixin';
import selectionMixin from '../selection/mixin';
import validateMixin from '../edit/validate';
import localStorageMixin from '../local-storage';
import layoutMethods from './layout-methods';
import coreMethods from './core-methods';
import interfaceMethods from './interface-methods';
import renderMethods from './render-table';

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
  mixins: [columnsMixin, expandableMixin, selectionMixin, validateMixin, localStorageMixin],
  data() {
    Object.assign(this, {
      // 原始数据
      tableOriginData: [],
      // 内存分页，每页显示的数据
      pageTableData: [],
      // 选中的行记录
      selectionRows: [],
      // 高级检索的条件
      superFilters: [],
      // 列汇总条件
      columnSummaryQuery: '',
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
      // 是否拥有多级表头
      isGroup: false,
      // 存放纵向 Y 虚拟滚动相关信息
      scrollYStore: {
        startIndex: 0,
        visibleIndex: 0,
        renderSize: 0,
        offsetSize: 0,
        visibleSize: 0,
        rowHeight: 0,
      },
      // 支持的排序方式
      sortDirections: ['ascend', 'descend'],
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
      rowExpandedKeys: [],
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
      // 服务端合计
      summaries: {},
    };
  },
  computed: {
    $vTable() {
      return this.$refs[`v-table`];
    },
    $$tableBody() {
      return this.$refs[`tableBody`];
    },
    tableColumns() {
      return this.createTableColumns(this.columns);
    },
    flattenColumns() {
      return columnsFlatMap(this.tableColumns);
    },
    allColumns() {
      return getAllColumns(this.tableColumns);
    },
    allRowKeys() {
      return getAllRowKeys(this.tableFullData, this.getRowKey);
    },
    deriveRowKeys() {
      return this.createDeriveRowKeys(this.tableFullData, null);
    },
    tableChange() {
      return [this.pagination, this.filters, this.sorter, { currentDataSource: [...this.tableFullData], allDataSource: [...this.tableOriginData] }];
    },
    leftFixedColumns() {
      return this.flattenColumns.filter((column) => column.fixed === 'left');
    },
    rightFixedColumns() {
      return this.flattenColumns.filter((column) => column.fixed === 'right');
    },
    showFooter() {
      return this.flattenColumns.some((x) => !!x.summation);
    },
    showPagination() {
      return this.isFetch || this.webPagination;
    },
    isHeadSorter() {
      return this.flattenColumns.some((column) => column.sorter);
    },
    isHeadFilter() {
      return this.flattenColumns.some((column) => column.filter);
    },
    isServerSummation() {
      return this.flattenColumns.some((x) => !!x.summation?.dataKey);
    },
    isSuperSearch() {
      return this.showSuperSearch && this.isHeadFilter;
    },
    isGroupSummary() {
      return this.flattenColumns.some((column) => !!column.groupSummary);
    },
    isTableEmpty() {
      return !this.tableData.length;
    },
    isTreeTable() {
      return this.tableFullData.some((x) => Array.isArray(x.children) && x.children.length);
    },
    isFetch() {
      return !!this.fetch;
    },
    fetchParams() {
      const orderby = createOrderBy(this.sorter);
      const query = createWhereSQL(this.filters, config.showFilterType) || createWhereSQL(this.superFilters, config.showFilterType);
      const params = this.isFetch ? this.fetch.params : null;
      const sorter = orderby ? { [config.sorterFieldName]: orderby } : null;
      // 去掉 where 参数单引号，为了兼容 MEP
      const filter = query ? { [config.filterFieldName]: query.replace(/'/g, '') } : null;
      const summary = this.columnSummaryQuery ? { [config.groupSummary.summaryFieldName]: this.columnSummaryQuery, usedJH: 1 } : null;
      return {
        ...sorter,
        ...filter,
        ...summary,
        ...params,
        ...this.pagination,
      };
    },
    bordered() {
      return this.border || this.isGroup;
    },
    tableSize() {
      const { $size } = useSize(this.$props);
      Object.assign(this.scrollYStore, { rowHeight: config.rowHeightMaps[$size] });
      return $size;
    },
    shouldUpdateHeight() {
      return this.height || this.maxHeight || this.isTableEmpty;
    },
    fullHeight() {
      const pagerHeight = this.showPagination ? 40 : 0;
      if (this.isFullScreen && this.shouldUpdateHeight) {
        return window.innerHeight - 30 - this.$refs[`v-top-info`].offsetHeight - pagerHeight;
      }
      return null;
    },
    tableStyles() {
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
    dataSource(next) {
      if (isEqual(next, this.tableFullData)) return;
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
      this.createTableData(next);
    },
    tableFullData() {
      // 处理内存分页
      this.createLimitData();
      // 加载表格数据
      this.loadTableData().then(() => {
        this.doLayout();
      });
      // 触发 dataChange 事件
      debounce(this.dataChangeHandle)();
    },
    columns(next) {
      this.setLocalColumns(next);
    },
    tableColumns() {
      this.doLayout();
    },
    filters() {
      this.$emit('change', ...this.tableChange);
    },
    sorter() {
      this.$emit('change', ...this.tableChange);
    },
    pagination: {
      handler() {
        this.$emit('change', ...this.tableChange);
      },
      deep: true,
    },
    [`fetch.params`]() {
      this.clearTableSorter();
      this.clearTableFilter();
      this.clearSuperSearch();
    },
    fetchParams(next, prev) {
      const isOnlyPageChange = this.onlyPaginationChange(next, prev);
      if (!isOnlyPageChange) {
        this.isFetch && debounce(this.clearRowSelection)();
      }
      if (!isOnlyPageChange && next.currentPage > 1 && !this.fetch?.stopToFirst) {
        this.toFirstPage();
      } else {
        this.isFetch && debounce(this.getTableData)();
      }
    },
    selectionKeys(next, prev) {
      if (!this.rowSelection || isEqual(next, prev)) return;
      const { onChange = noop } = this.rowSelection;
      // 设置选中的行数据
      this.createSelectionRows(next);
      onChange(next, this.selectionRows);
    },
    [`rowSelection.selectedRowKeys`](next) {
      if (this.rowSelection.type === 'radio') {
        this.$$tableBody.setClickedValues(next.length ? [next[0], '__selection__'] : []);
      }
      this.selectionKeys = this.createSelectionKeys(next);
      if (this.isTreeTable) {
        this.rowExpandedKeys = this.createRowExpandedKeys();
      }
    },
    [`expandable.expandedRowKeys`]() {
      this.rowExpandedKeys = this.createRowExpandedKeys();
    },
    [`treeStructure.expandedRowKeys`]() {
      this.rowExpandedKeys = this.createRowExpandedKeys();
    },
    rowExpandedKeys(next, prev) {
      if (!this.expandable || isEqual(next, prev)) return;
      const { onChange = noop } = this.expandable;
      const expandedRows = tableDataFlatMap(this.tableFullData).filter((record) => next.includes(this.getRowKey(record, record.index)));
      onChange(next, expandedRows);
    },
    highlightKey(next) {
      if (!this.rowHighlight) return;
      const { onChange = noop } = this.rowHighlight;
      const currentRow = tableDataFlatMap(this.tableFullData).find((record) => this.getRowKey(record, record.index) === next);
      onChange(next, currentRow || null);
    },
    [`rowHighlight.currentRowKey`](next) {
      this.$$tableBody.setClickedValues(!isEmpty(next) ? [next, 'index'] : []);
      this.highlightKey = this.rowHighlight?.currentRowKey ?? this.highlightKey;
    },
    [`layout.viewportHeight`](next) {
      const visibleYSize = Math.ceil(next / this.scrollYStore.rowHeight);
      const renderSize = isChrome() ? visibleYSize + 3 : visibleYSize + 5;
      Object.assign(this.scrollYStore, { visibleSize: visibleYSize, offsetSize: visibleYSize, renderSize });
    },
    scrollYLoad(next) {
      !next ? this.updateScrollYSpace(!0) : this.loadScrollYData(this.$$tableBody.prevST);
    },
    scrollX(next) {
      this.isPingRight = next;
    },
    loading(next) {
      this.showLoading = next;
    },
  },
  created() {
    this.columnSummaryQuery = this.createColumnSummary();
    if (!this.isFetch) {
      this.createTableData(this.dataSource);
    } else {
      this.getTableData();
    }
    // 加载表格数据
    this.loadTableData().then(() => {
      this.doLayout();
    });
  },
  mounted() {
    this.doLayout();
    this.bindEvents();
    this.createResizeState();
  },
  activated() {
    this.scrollYLoad && this.loadScrollYData(0);
    this.calcTableHeight();
  },
  unmounted() {
    this.destroy();
  },
  methods: {
    ...coreMethods,
    ...layoutMethods,
    ...interfaceMethods,
    ...renderMethods,
    getRowKey(row: Record<string, any>, index: number): string {
      const { rowKey } = this;
      const key: string = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (key === undefined) {
        warn('Table', 'Each record in table should have a unique `key` prop, or set `rowKey` to an unique primary key.');
        return index.toString();
      }
      return key;
    },
  },
  render(): JSXNode {
    return this.renderTable();
  },
});
