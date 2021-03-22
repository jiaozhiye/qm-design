/*
 * @Author: 焦质晔
 * @Date: 2020-02-28 23:01:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 16:26:30
 */
import { defineComponent, reactive } from 'vue';
import { pickBy, intersection, isFunction } from 'lodash-es';
import { hasOwn, convertToRows, deepFindColumn, getCellValue, createWhereSQL } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { isEmpty } from '../../../_utils/util';
import { stop } from '../../../_utils/dom';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';
import { IColumn, IDerivedColumn, IFilter, ISorter } from '../table/types';

import { where } from '../filter-sql';
import config from '../config';

import Resizable from './resizable';
import AllSelection from '../selection/all';
import THeadFilter from '../filter';
import TooltipIcon from '../icon/tooltip';
import CaretUpIcon from '../icon/caretup';
import CaretDownIcon from '../icon/caretdown';

export default defineComponent({
  name: 'TableHeader',
  props: ['tableColumns', 'flattenColumns', 'sortDirections'],
  provide() {
    return {
      $$header: this,
    };
  },
  inject: ['$$table'],
  data() {
    return {
      filters: {},
      sorter: {},
      ascend: this.sortDirections[0],
      descend: this.sortDirections[1],
    };
  },
  computed: {
    isClientSorter(): boolean {
      return !this.$$table.isFetch;
    },
    isClientFilter(): boolean {
      return !this.$$table.isFetch;
    },
  },
  watch: {
    filters(val: IFilter): void {
      this.filterHandle();
      // if (this.isClientFilter) return;
      this.$$table.filters = this.formatFilterValue(val);
    },
    sorter(val: ISorter) {
      this.sorterHandle();
      // if (this.isClientSorter) return;
      this.$$table.sorter = this.formatSorterValue(val);
    },
  },
  methods: {
    renderColgroup(): JSXNode {
      const {
        layout: { gutterWidth },
        scrollY,
      } = this.$$table;
      return (
        <colgroup>
          {this.flattenColumns.map((column) => {
            const { dataIndex, width, renderWidth } = column;
            return <col key={dataIndex} style={{ width: `${width || renderWidth}px`, minWidth: `${width || renderWidth}px` }} />;
          })}
          {scrollY && <col style={{ width: `${gutterWidth}px`, minWidth: `${gutterWidth}px` }} />}
        </colgroup>
      );
    },
    renderRows(columnRows: Array<IColumn[]>): JSXNode[] {
      const { scrollY, isIE, rightFixedColumns } = this.$$table;
      const cls = [
        `gutter`,
        {
          [`cell-fix-right`]: !!rightFixedColumns.length,
        },
      ];
      const stys = !isIE
        ? {
            right: !!rightFixedColumns.length ? 0 : '',
          }
        : null;
      return columnRows.map((columns, rowIndex) => (
        <tr key={rowIndex} class="header--row">
          {columns.map((column, cellIndex) => this.renderColumn(column, columns, rowIndex, cellIndex))}
          {scrollY && <th class={cls} style={{ ...stys }}></th>}
        </tr>
      ));
    },
    renderColumn(column: IColumn, columns: IColumn[], rowIndex: number, cellIndex: number): JSXNode {
      const {
        getStickyLeft,
        getStickyRight,
        layout: { gutterWidth },
        resizable,
        scrollY,
        sorter,
        isIE,
      } = this.$$table;
      const {
        dataIndex,
        colSpan,
        rowSpan,
        fixed,
        align: tbodyAlign,
        theadAlign,
        sorter: isSorter,
        filter,
        required,
        lastFixedLeft,
        firstFixedRight,
      } = column as IDerivedColumn;
      // 表头对齐方式
      const align = theadAlign || tbodyAlign;
      const cls = [
        `header--column`,
        `col--ellipsis`,
        {
          [`col--center`]: align === 'center',
          [`col--right`]: align === 'right',
          [`column--required`]: !!required,
          [`column-has-sorter`]: isSorter,
          [`column-has-filter`]: filter,
          [`column--sort`]: Object.keys(sorter).includes(dataIndex),
          [`cell-fix-left`]: fixed === 'left',
          [`cell-fix-right`]: fixed === 'right',
          [`cell-fix-left-last`]: !isIE && fixed === 'left' && lastFixedLeft,
          [`cell-fix-right-first`]: !isIE && fixed === 'right' && firstFixedRight,
        },
      ];
      const stys = !isIE
        ? {
            left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
            right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
          }
        : null;
      const isResizable = resizable && !['__expandable__', '__selection__'].includes(dataIndex);
      return (
        <th key={dataIndex} class={cls} style={{ ...stys }} colspan={colSpan} rowspan={rowSpan} onClick={(ev) => this.thClickHandle(ev, column)}>
          <div class="cell--wrapper">
            <div class="cell--text">{this.renderCell(column)}</div>
            {filter ? this.renderFilter(column) : null}
          </div>
          {isResizable && <Resizable column={column} />}
        </th>
      );
    },
    renderCell(column: IColumn): JSXNode {
      const { dataIndex, type, sorter, title, description } = column as IDerivedColumn;
      const { selectionKeys } = this.$$table;
      if (dataIndex === '__selection__' && type === 'checkbox') {
        return (
          <div class="cell">
            <AllSelection selectionKeys={selectionKeys} />
          </div>
        );
      }
      const vNodes: JSXNode[] = [];
      vNodes.push(
        <div class="cell" title={title}>
          {title}
        </div>
      );
      if (description) {
        vNodes.push(
          <el-tooltip effect="dark" placement="top" content={description} style={{ marginLeft: '2px' }}>
            <TooltipIcon onClick={(ev) => stop(ev)} />
          </el-tooltip>
        );
      }
      if (sorter) {
        vNodes.push(this.renderSorter(this.sorter[dataIndex]));
      }
      return vNodes;
    },
    renderSorter(order: string): JSXNode {
      const ascCls = [
        `icon-svg cell--sorter__asc`,
        {
          [`actived`]: order === this.ascend,
        },
      ];
      const descCls = [
        `icon-svg cell--sorter__desc`,
        {
          [`actived`]: order === this.descend,
        },
      ];
      return (
        <div class="cell--sorter" title={t('qm.table.sorter.text')}>
          <span class={ascCls}>
            <CaretUpIcon />
          </span>
          <span class={descCls}>
            <CaretDownIcon />
          </span>
        </div>
      );
    },
    renderFilter(column: IColumn): JSXNode {
      return <THeadFilter column={column} filters={this.filters} />;
    },
    thClickHandle(ev: MouseEvent, column: IColumn): void {
      const { multipleSort } = this.$$table;
      const { sorter, dataIndex } = column;
      if (sorter) {
        const current = this.sorter[dataIndex];
        const order = current ? (current === this.descend ? null : this.descend) : this.ascend;
        // 设置排序值
        if (!multipleSort) {
          this.sorter = Object.assign({}, { [dataIndex]: order });
        } else {
          // 后点击的排序列，key 排在最后
          delete this.sorter[dataIndex];
          this.sorter = Object.assign({}, this.sorter, { [dataIndex]: order });
        }
      }
    },
    // 表头排序
    sorterHandle(): void {
      if (!this.isClientSorter) return;
      this.clientSorter();
    },
    // 客户端排序
    clientSorter(): void {
      const validSorter = pickBy(this.sorter);
      for (let key in validSorter) {
        let column = this.flattenColumns.find((column) => column.dataIndex === key);
        this.doSortHandle(column, validSorter[key]);
      }
      if (!Object.keys(validSorter).length) {
        this.doResetHandle();
      }
    },
    // 还原排序数据
    doResetHandle(): void {
      const { tableFullData, tableOriginData } = this.$$table;
      this.$$table.tableFullData = intersection(tableOriginData, tableFullData);
    },
    // 排序算法
    doSortHandle(column: IColumn, order: string): void {
      const { dataIndex, sorter } = column;
      if (isFunction(sorter)) {
        this.$$table.tableFullData.sort(sorter);
      } else {
        this.$$table.tableFullData.sort((a, b) => {
          const start = getCellValue(a, dataIndex);
          const end = getCellValue(b, dataIndex);
          if (!!Number(start - end)) {
            return order === this.ascend ? start - end : end - start;
          }
          return order === this.ascend ? start.toString().localeCompare(end.toString()) : end.toString().localeCompare(start.toString());
        });
      }
      this.$$table.tableFullData = reactive([...this.$$table.tableFullData]);
    },
    // 表头筛选
    filterHandle(): void {
      if (!this.isClientFilter) return;
      this.clientFilter();
    },
    // 客户端筛选
    clientFilter(): void {
      const { tableOriginData, superFilters } = this.$$table;
      const sql = !superFilters.length ? createWhereSQL(this.filters) : createWhereSQL(superFilters);
      this.$$table.tableFullData = sql !== '' ? where(tableOriginData, sql) : [...tableOriginData];
      // 执行排序
      this.sorterHandle();
    },
    // 格式化排序参数
    formatSorterValue(sorter: ISorter): ISorter {
      const result = {};
      for (let key in sorter) {
        if (sorter[key] === null) continue;
        result[key] = sorter[key];
      }
      return result;
    },
    // 格式化筛选参数
    formatFilterValue(filters: IFilter): IFilter {
      const result = {};
      for (let key in filters) {
        if (!key.includes('|')) continue;
        let [type, property] = key.split('|');
        for (let mark in filters[key]) {
          if (isEmpty(filters[key][mark])) {
            delete filters[key][mark];
          }
        }
        // result[`${type}|${property}`]
        result[config.showFilterType ? `${type}|${property}` : property] = filters[key];
      }
      return result;
    },
    // 清空表头排序
    clearTheadSorter(): void {
      this.sorter = {};
    },
    // 清空表头筛选
    clearTheadFilter(): void {
      this.filters = {};
    },
    // 处理固定列
    setFixedColumns(columnRows: Array<IDerivedColumn[]>): void {
      columnRows.forEach((columns, depth) => {
        const leftFixedColumns: IColumn[] = [];
        const rightFixedColumns: IColumn[] = [];
        columns.forEach((x) => {
          hasOwn(x, 'lastFixedLeft') && delete x.lastFixedLeft;
          hasOwn(x, 'firstFixedRight') && delete x.firstFixedRight;
          x.fixed === 'left' && leftFixedColumns.push(x);
          x.fixed === 'right' && rightFixedColumns.push(x);
        });
        const lastColumn: IDerivedColumn = leftFixedColumns[leftFixedColumns.length - 1];
        const firstColumn: IDerivedColumn = rightFixedColumns[0];
        if (lastColumn) {
          lastColumn.lastFixedLeft =
            depth === 0 ? !0 : (deepFindColumn(this.tableColumns, lastColumn.parentDataIndex as string) as IDerivedColumn).lastFixedLeft;
        }
        if (firstColumn) {
          firstColumn.firstFixedRight =
            depth === 0 ? !0 : (deepFindColumn(this.tableColumns, firstColumn.parentDataIndex as string) as IDerivedColumn).firstFixedRight;
        }
      });
    },
  },
  render(): JSXNode {
    const { tableColumns } = this;
    const {
      layout: { tableBodyWidth },
    } = this.$$table;
    const prefixCls = getPrefixCls('table');
    const columnRows = convertToRows(tableColumns);
    // 是否拥有多级表头
    this.$$table.isGroup = columnRows.length > 1;
    // 处理左右的固定列
    this.setFixedColumns(columnRows);
    return (
      <div class={`${prefixCls}--header-wrapper`}>
        <table class={`${prefixCls}--header`} cellspacing="0" cellpadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
          {this.renderColgroup()}
          <thead>{this.renderRows(columnRows)}</thead>
        </table>
      </div>
    );
  },
});
