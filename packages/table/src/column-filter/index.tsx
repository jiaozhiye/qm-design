/*
 * @Author: 焦质晔
 * @Date: 2020-03-17 10:29:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 14:50:45
 */
import { defineComponent, reactive } from 'vue';
import Draggable from 'vuedraggable';
import classnames from 'classnames';
import { JSXNode } from '../../../_utils/types';
import Checkbox from '../checkbox';
import SorterIcon from '../icon/sorter';

import { getPrefixCls } from '../../../_utils/prefix';
import { noop } from '../../../_utils/util';

import { t } from '../../../locale';

export default defineComponent({
  name: 'ColumnFilter',
  props: ['columns'],
  inject: ['$$table'],
  data() {
    return {
      visible: false,
      leftFixedColumns: [],
      rightFixedColumns: [],
      mainColumns: [],
    };
  },
  computed: {
    realColumns() {
      return [...this.leftFixedColumns, ...this.mainColumns, ...this.rightFixedColumns];
    },
    showButtonText() {
      const { global } = this.$DESIGN;
      return !(this.$$table.onlyShowIcon ?? global['table_onlyShowIcon'] ?? !1);
    },
  },
  watch: {
    columns() {
      this.createColumns();
    },
  },
  created() {
    this.createColumns();
  },
  methods: {
    createColumns() {
      this.leftFixedColumns = this.columns.filter((column) => column.fixed === 'left');
      this.rightFixedColumns = this.columns.filter((column) => column.fixed === 'right');
      this.mainColumns = this.columns.filter((column) => !column.fixed);
    },
    fixedChangeHandle(column, dir) {
      column.fixed = dir;
      this.createColumns();
      this.changeHandle();
    },
    cancelFixedHandle(column) {
      delete column.fixed;
      this.createColumns();
      this.changeHandle();
    },
    changeHandle() {
      const { columnsChange = noop } = this.$$table;
      columnsChange(this.realColumns);
    },
    renderListItem(column, type) {
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
    renderColumnFilter() {
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
          <div class="divider"></div>
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
          <div class="divider"></div>
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
        placement="bottom-start"
        transition="el-zoom-in-top"
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
              {showButtonText && t('qm.table.columnFilter.text')}
            </span>
          ),
        }}
      >
        {this.visible && this.renderColumnFilter()}
      </el-popover>
    );
  },
});
