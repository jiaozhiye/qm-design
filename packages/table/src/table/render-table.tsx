/*
 * @Author: 焦质晔
 * @Date: 2020-02-29 22:17:28
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 09:56:45
 */
import { getPrefixCls } from '../../../_utils/prefix';

import TableHeader from '../header';
import TableBody from '../body';
import TableFooter from '../footer';
import Pager from '../pager';
import Spin from '../../../spin';
import EmptyContent from '../empty';
import Alert from '../alert';
import ColumnFilter from '../column-filter';
import GroupSummary from '../group-summary';
import HighSearch from '../high-search';
import FullScreen from '../full-screen';
import Export from '../export';
import PrintTable from '../print';
import Reload from '../reload';
import { JSXNode } from '../../../_utils/types';

const prefixCls = getPrefixCls('table');

export default {
  renderBorderLine(): JSXNode {
    return this.bordered && <div class={`${prefixCls}--border-line`} />;
  },
  renderResizableLine(): JSXNode {
    return this.resizable && <div ref="resizable-bar" class={`${prefixCls}--resizable-bar`} />;
  },
  renderTable(): JSXNode {
    const {
      isFullScreen,
      tableData,
      columns,
      tableColumns,
      flattenColumns,
      tableSize,
      showLoading,
      bordered,
      tableStyles,
      rowStyle,
      cellStyle,
      showHeader,
      showFooter,
      showPagination,
      isGroup,
      isHeadSorter,
      isHeadFilter,
      isTableEmpty,
      sortDirections,
      scrollX,
      scrollY,
      scrollYLoad,
      isPingLeft,
      isPingRight,
      leftFixedColumns,
      rightFixedColumns,
      fetch,
      fetchParams,
      pagination,
      paginationConfig,
      total,
      selectionKeys,
      showAlert,
      topSpaceAlign,
      showFullScreen,
      showRefresh,
      tablePrint,
      exportExcel,
      isSuperSearch,
      isGroupSummary,
      showColumnDefine,
    } = this;

    const wrapperCls = {
      [`${prefixCls}--wrapper`]: true,
      [`${prefixCls}--maximize`]: isFullScreen,
      [`${prefixCls}--medium`]: tableSize === 'medium',
      [`${prefixCls}--small`]: tableSize === 'small',
      [`${prefixCls}--mini`]: tableSize === 'mini',
    };
    const tableCls = {
      [prefixCls]: true,
      [`is--border`]: bordered,
      [`is--fixed`]: leftFixedColumns.length || rightFixedColumns.length,
      [`is--group`]: isGroup,
      [`is--sortable`]: isHeadSorter,
      [`is--filterable`]: isHeadFilter,
      [`is--empty`]: isTableEmpty,
      [`show--head`]: showHeader,
      [`show--foot`]: showFooter,
      [`ping--left`]: isPingLeft,
      [`ping--right`]: isPingRight,
      [`scroll--x`]: scrollX,
      [`scroll--y`]: scrollY,
      [`virtual--y`]: scrollYLoad,
    };
    const tableHeaderProps = {
      ref: 'tableHeader',
      tableColumns,
      flattenColumns,
      sortDirections,
    };
    const tableBodyProps = {
      ref: 'tableBody',
      tableData,
      flattenColumns,
      rowStyle,
      cellStyle,
    };
    const tableFooterProps = {
      ref: 'tableFooter',
      flattenColumns,
    };
    const alertProps = {
      total,
      selectionKeys,
    };
    const printProps = tablePrint
      ? {
          tableColumns,
          flattenColumns,
          showHeader,
          showFooter,
          showLogo: tablePrint.showLogo ?? !0,
        }
      : null;
    const exportProps = exportExcel
      ? {
          tableColumns,
          flattenColumns,
          fileName: exportExcel.fileName,
          fetch: !!fetch
            ? {
                api: fetch.api,
                params: fetchParams,
                dataKey: fetch.dataKey,
                total,
              }
            : null,
        }
      : null;
    const pagerProps = {
      ...Object.assign({}, paginationConfig, {
        size: tableSize,
        total,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
      }),
      onCurrentChange: this.pagerChangeHandle,
      onSizeChange: this.pagerChangeHandle,
    };
    return (
      <div class={wrapperCls}>
        <div ref="topper" class={`${prefixCls}-top`}>
          <div class={`${prefixCls}-top__space`}>
            {/* 顶部信息 */}
            {showAlert && <Alert {...alertProps} />}
            <div class={`${prefixCls}-top__space-slot`} style={{ textAlign: topSpaceAlign }}>
              {/* 默认槽口 */}
              {this.$slots.default?.()}
            </div>
          </div>
          <div class={`${prefixCls}-top__actions`}>
            {/* 全屏 */}
            {showFullScreen && <FullScreen />}
            {/* 刷新 */}
            {showRefresh && !!fetch && <Reload />}
            {/* 打印 */}
            {tablePrint && <PrintTable {...printProps} />}
            {/* 导出 */}
            {exportExcel && <Export {...exportProps} />}
            {/* 高级检索 */}
            {isSuperSearch && <HighSearch columns={flattenColumns} />}
            {/* 分组汇总 */}
            {/* {isGroupSummary && <GroupSummary columns={flattenColumns} />} */}
            {/* 列定义 */}
            {showColumnDefine && <ColumnFilter columns={columns} />}
          </div>
        </div>
        {/* @ts-ignore: loading 组件 */}
        <Spin spinning={showLoading} tip="Loading...">
          <div ref="table" class={tableCls} style={tableStyles}>
            {/* 主要内容 */}
            <div class={`${prefixCls}--main-wrapper`}>
              {/* 头部 */}
              {showHeader && <TableHeader {...tableHeaderProps} />}
              {/* 表格体 */}
              <TableBody {...tableBodyProps} />
              {/* 底部 */}
              {showFooter && <TableFooter {...tableFooterProps} />}
            </div>
            {/* 边框线 */}
            {this.renderBorderLine()}
            {/* 空数据 */}
            {isTableEmpty && <EmptyContent />}
            {/* 列宽线 */}
            {this.renderResizableLine()}
          </div>
        </Spin>
        {/* 分页 */}
        {showPagination && <Pager {...pagerProps} />}
      </div>
    );
  },
};
