/*
 * @Author: 焦质晔
 * @Date: 2020-03-17 10:29:47
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 14:01:34
 */
import { defineComponent } from 'vue';
import Draggable from 'vuedraggable';
import Checkbox from '../checkbox';

import { noop } from '../../../_utils/util';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

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
      const cls = [`iconfont`, `icon-menu`, `v-handle`, [`${type}-handle`]];
      const checkboxProps = {
        modelValue: !column.hidden,
        'onUpdate:modelValue': (val) => (column.hidden = !val),
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
      const { leftFixedColumns, mainColumns, rightFixedColumns, dragOptions } = this;
      const cls = [`v-column-filter--wrap`, `size--${this.$$table.tableSize}`];
      return (
        <div class={cls}>
          <div class="left">
            <Draggable
              value={leftFixedColumns}
              handle=".left-handle"
              options={dragOptions}
              onInput={(list) => {
                this.leftFixedColumns = list;
              }}
              onChange={this.changeHandle}
            >
              <transition-group type="transition">{leftFixedColumns.map((column) => this.renderListItem(column, 'left'))}</transition-group>
            </Draggable>
          </div>
          <div class="divider"></div>
          <div class="main">
            <Draggable
              value={mainColumns}
              handle=".main-handle"
              options={dragOptions}
              onInput={(list) => {
                this.mainColumns = list;
              }}
              onChange={this.changeHandle}
            >
              <transition-group type="transition">{mainColumns.map((column) => this.renderListItem(column, 'main'))}</transition-group>
            </Draggable>
          </div>
          <div class="divider"></div>
          <div class="right">
            <Draggable
              value={rightFixedColumns}
              handle=".right-handle"
              options={dragOptions}
              onInput={(list) => {
                this.rightFixedColumns = list;
              }}
              onChange={this.changeHandle}
            >
              <transition-group type="transition">{rightFixedColumns.map((column) => this.renderListItem(column, 'right'))}</transition-group>
            </Draggable>
          </div>
        </div>
      );
    },
  },
  render() {
    const { visible, showButtonText } = this;
    const cls = [`v-column-filter`, `size--${this.$$table.tableSize}`];
    return (
      <div class={cls}>
        <el-popover
          v-model={[this.visible, 'visible']}
          trigger="manual"
          placement="bottom-start"
          transition="el-zoom-in-top"
          append-to-body={true}
          stop-popper-mouse-event={false}
          gpu-acceleration={false}
          v-slots={{
            reference: (): JSXNode => (
              <span class={{ [`text`]: !0, [`selected`]: visible }} title={!showButtonText ? t('qm.table.columnFilter.text') : ''}>
                <i class="iconfont icon-unorderedlist" />
                {showButtonText && t('qm.table.columnFilter.text')}
              </span>
            ),
          }}
        >
          <div>{this.renderColumnFilter()}</div>
        </el-popover>
      </div>
    );
  },
});
