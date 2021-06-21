/*
 * @Author: 焦质晔
 * @Date: 2020-03-01 23:54:20
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-15 08:36:43
 */
import { defineComponent } from 'vue';
import { setCellValue, getCellValue } from '../utils';
import formatMixin from '../body/format';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';
import { IColumn, IRecord } from '../table/types';

export default defineComponent({
  name: 'TableFooter',
  props: ['flattenColumns'],
  inject: ['$$table'],
  mixins: [formatMixin],
  computed: {
    summationRows(): Record<string, string>[] {
      const { tableFullData, selectionKeys, selectionRows, summaries, getGroupValidData, isGroupSubtotal } = this.$$table;
      const summationColumns = this.flattenColumns.filter((x) => typeof x.summation !== 'undefined');
      // 结果
      const res = {};
      summationColumns.forEach((column) => {
        const {
          dataIndex,
          precision,
          formatType = 'finance', // 默认货币格式
          summation: { sumBySelection, displayWhenNotSelect, unit = '', onChange = noop },
        } = column;
        const tableDataList: IRecord[] = !isGroupSubtotal ? tableFullData : getGroupValidData(tableFullData);
        // 未选择时，显示合计结果
        const notSelectAndDisplay: boolean = !selectionKeys.length && displayWhenNotSelect;
        let values: number[] = [];
        // 可选择列动态合计
        if (!sumBySelection || notSelectAndDisplay) {
          values = tableDataList.map((x) => Number(getCellValue(x, dataIndex)));
        } else {
          values = selectionRows.map((record) => Number(getCellValue(record, dataIndex)));
        }
        // 累加求和
        let result: number | string = values.reduce((prev, curr) => {
          const value = Number(curr);
          if (!Number.isNaN(value)) {
            return prev + curr;
          }
          return prev;
        }, 0);
        // 服务端合计
        const isServerSummation: boolean = Object.keys(summaries).includes(dataIndex);
        if (isServerSummation && (!sumBySelection || notSelectAndDisplay)) {
          result = getCellValue(summaries, dataIndex);
        }
        result = precision >= 0 ? (result as number).toFixed(precision) : result;
        // 处理数据格式化
        result = this[`${formatType}Format`]?.(result) ?? result;
        // 设置合计值
        setCellValue(res, dataIndex, unit ? `${result} ${unit}` : result);
        // 触发事件
        onChange(result);
      });
      return [res];
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
    renderRows(): JSXNode[] {
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
      return this.summationRows.map((row) => (
        <tr class="footer--row">
          {this.flattenColumns.map((column, index) => this.renderCell(column, row, index))}
          {scrollY && <td class={cls} style={{ ...stys }}></td>}
        </tr>
      ));
    },
    renderCell(column: IColumn, row: IRecord, index: number): JSXNode {
      const {
        tableFullData,
        leftFixedColumns,
        rightFixedColumns,
        getStickyLeft,
        getStickyRight,
        layout: { gutterWidth },
        scrollY,
        isIE,
      } = this.$$table;
      const { dataIndex, fixed, align, summation } = column;
      const cls = [
        `footer--column`,
        `col--ellipsis`,
        {
          [`col--center`]: align === 'center',
          [`col--right`]: align === 'right',
          [`cell-fix-left`]: fixed === 'left',
          [`cell-fix-right`]: fixed === 'right',
          [`cell-fix-left-last`]: !isIE && fixed === 'left' && leftFixedColumns[leftFixedColumns.length - 1].dataIndex === dataIndex,
          [`cell-fix-right-first`]: !isIE && fixed === 'right' && rightFixedColumns[0].dataIndex === dataIndex,
        },
      ];
      const stys = !isIE
        ? {
            left: fixed === 'left' ? `${getStickyLeft(dataIndex)}px` : '',
            right: fixed === 'right' ? `${getStickyRight(dataIndex) + (scrollY ? gutterWidth : 0)}px` : '',
          }
        : null;
      const text = summation?.render ? summation.render(tableFullData) : getCellValue(row, dataIndex);
      return (
        <td key={dataIndex} class={cls} style={{ ...stys }}>
          <div class="cell">{index === 0 && text === '' ? t('qm.table.config.summaryText') : text}</div>
        </td>
      );
    },
  },
  render(): JSXNode {
    const {
      layout: { tableBodyWidth },
    } = this.$$table;
    const prefixCls = getPrefixCls('table');
    return (
      <div class={`${prefixCls}--footer-wrapper`}>
        <table class={`${prefixCls}--footer`} cellspacing="0" cellpadding="0" style={{ width: tableBodyWidth ? `${tableBodyWidth}px` : '' }}>
          {this.renderColgroup()}
          <tfoot>{this.renderRows()}</tfoot>
        </table>
      </div>
    );
  },
});
