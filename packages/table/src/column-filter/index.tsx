/*
 * @Author: 焦质晔
 * @Date: 2020-03-17 10:29:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-04-07 17:21:00
 */
import { defineComponent, reactive } from 'vue';
import { cloneDeep } from 'lodash-es';
import Draggable from 'vuedraggable';
import classnames from 'classnames';
import { JSXNode } from '../../../_utils/types';
import { IColumn, IFixed } from '../table/types';
import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';
import { t } from '../../../locale';

import Checkbox from '../checkbox';
import SorterIcon from '../icon/sorter';

export default defineComponent({
  name: 'ColumnFilter',
  props: ['columns'],
  inject: ['$$table'],
  data() {
    Object.assign(this, { colGroups: [] }); // 表头跨列分组
    return {
      visible: false,
      leftFixedColumns: [],
      rightFixedColumns: [],
      mainColumns: [],
    };
  },
  computed: {
    realColumns(): IColumn[] {
      return [...this.leftFixedColumns, ...this.mainColumns, ...this.rightFixedColumns];
    },
    showButtonText(): boolean {
      const { global } = this.$DESIGN;
      return !(this.$$table.onlyShowIcon ?? global['table_onlyShowIcon'] ?? !1);
    },
  },
  watch: {
    columns(): void {
      this.createColumns();
    },
  },
  created(): void {
    this.createColumns();
    this.createColGroups();
  },
  methods: {
    createColumns(): void {
      this.leftFixedColumns = this.columns.filter((column) => column.fixed === 'left');
      this.rightFixedColumns = this.columns.filter((column) => column.fixed === 'right');
      this.mainColumns = this.columns.filter((column) => !column.fixed);
    },
    createColGroups(): void {
      this.columns.forEach((column, i) => {
        const { colSpan } = column;
        if (colSpan > 1 && this.columns.slice(i + 1, i + colSpan).every(({ colSpan }) => colSpan === 0)) {
          this.colGroups.push(this.columns.slice(i, i + colSpan));
        }
      });
    },
    fixedChangeHandle(column: IColumn, dir: IFixed): void {
      column.fixed = dir;
      this.createColumns();
      this.changeHandle();
    },
    cancelFixedHandle(column: IColumn): void {
      delete column.fixed;
      this.createColumns();
      this.changeHandle();
    },
    changeHandle(): void {
      const { columnsChange = noop } = this.$$table;
      columnsChange(this.realColumns);
    },
    resetColumnsHandle(): void {
      const { columnsChange = noop } = this.$$table;
      const realColumns = cloneDeep(this.$$table.originColumns);
      columnsChange(reactive(realColumns));
    },
    renderListItem(column: IColumn, type: string): JSXNode {
      const { colSpan } = column;
      if (colSpan === 0) {
        return <li key={column.dataIndex} style={{ display: 'none' }} />;
      }
      const cls = [`iconfont`, `icon-menu`, `handle`, [`${type}-handle`]];
      const checkboxProps = {
        modelValue: !column.hidden,
        'onUpdate:modelValue': (val) => {
          column.hidden = !val;
        },
      };
      return (
        <li key={column.dataIndex} class="item">
          <Checkbox {...checkboxProps} disabled={column.required} onChange={this.changeHandle} />
          <i class={cls} title={t('qm.table.columnFilter.draggable')} />
          <span title={column.title}>{column.title}</span>
          {type === 'main' ? (
            <span class="fixed">
              <i
                class="iconfont icon-step-backward"
                title={t('qm.table.columnFilter.fixedLeft')}
                onClick={() => this.fixedChangeHandle(column, 'left')}
              />
              <i
                class="iconfont icon-step-forward"
                title={t('qm.table.columnFilter.fixedRight')}
                onClick={() => this.fixedChangeHandle(column, 'right')}
              />
            </span>
          ) : (
            <span class="fixed">
              <i class="iconfont icon-close-circle" title={t('qm.table.columnFilter.cancelFixed')} onClick={() => this.cancelFixedHandle(column)} />
            </span>
          )}
        </li>
      );
    },
    renderColumnFilter(): JSXNode {
      const { leftFixedColumns, mainColumns, rightFixedColumns } = this;

      const leftDragProps = {
        modelValue: leftFixedColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.left-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.leftFixedColumns = reactive(val);
        },
        onChange: this.changeHandle,
      };

      const mainDragProps = {
        modelValue: mainColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.main-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.mainColumns = reactive(val);
        },
        onChange: this.changeHandle,
      };

      const rightDragProps = {
        modelValue: rightFixedColumns,
        itemKey: 'dataIndex',
        animation: 200,
        handle: '.right-handle',
        tag: 'transition-group',
        componentData: {
          tag: 'ul',
          type: 'transition-group',
        },
        'onUpdate:modelValue': (val) => {
          this.rightFixedColumns = reactive(val);
        },
        onChange: this.changeHandle,
      };

      return (
        <div class="column-filter--wrap">
          <div class="reset">
            <el-button type="text" onClick={this.resetColumnsHandle}>
              {t('qm.table.columnFilter.reset')}
            </el-button>
          </div>
          <div class="left">
            <Draggable
              {...leftDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'left');
                },
              }}
            />
          </div>
          <div class="divider" />
          <div class="main">
            <Draggable
              {...mainDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'main');
                },
              }}
            />
          </div>
          <div class="divider" />
          <div class="right">
            <Draggable
              {...rightDragProps}
              v-slots={{
                item: ({ element: column }): JSXNode => {
                  return this.renderListItem(column, 'right');
                },
              }}
            />
          </div>
        </div>
      );
    },
  },
  render(): JSXNode {
    const { tableSize } = this.$$table;
    const { visible, showButtonText } = this;
    const prefixCls = getPrefixCls('table');
    const popperCls = {
      [`${prefixCls}__popper`]: true,
      [`${prefixCls}__popper--medium`]: tableSize === 'medium',
      [`${prefixCls}__popper--small`]: tableSize === 'small',
      [`${prefixCls}__popper--mini`]: tableSize === 'mini',
    };
    return (
      <el-popover
        popper-class={`${classnames(popperCls)}`}
        v-model={[this.visible, 'visible']}
        width="auto"
        trigger="click"
        placement="bottom-end"
        transition="el-zoom-in-top"
        offset={10}
        append-to-body={true}
        stop-popper-mouse-event={false}
        gpu-acceleration={false}
        v-slots={{
          reference: (): JSXNode => (
            <span
              class={{ [`${prefixCls}-column-filter`]: !0, [`selected`]: visible }}
              title={!showButtonText ? t('qm.table.columnFilter.text') : ''}
            >
              <em class="icon-svg">
                <SorterIcon />
              </em>
              <span>{showButtonText && t('qm.table.columnFilter.text')}</span>
            </span>
          ),
        }}
      >
        {this.visible && this.renderColumnFilter()}
      </el-popover>
    );
  },
});
