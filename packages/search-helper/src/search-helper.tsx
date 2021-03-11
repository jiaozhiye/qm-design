/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 14:37:33
 */
import { defineComponent, PropType } from 'vue';
import addEventListener from 'add-dom-event-listener';
import { merge, get, isFunction } from 'lodash-es';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, ComponentSize, AnyObject } from '../../_utils/types';
import { useSize } from '../../hooks/useSize';
import { noop, debounce } from '../../_utils/util';
import { getParentNode } from '../../_utils/dom';
import { isValidComponentSize } from '../../_utils/validators';
import { warn } from '../../_utils/error';
import { t } from '../../locale';

import Spin from '../../spin';
import Form from '../../form';
import Table from '../../table';

type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

enum footHeight {
  default = 60,
  medium = 56,
  small = 52,
  mini = 48,
}

const trueNoop = () => !0;
// tds
const DEFINE = ['valueName', 'displayName', 'descriptionName'];

export default defineComponent({
  name: 'QmSearchHelper',
  componentName: 'QmSearchHelper',
  inheritAttrs: false,
  emits: ['close'],
  props: {
    name: PropTypes.string, // tds
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    filters: PropTypes.array.def([]),
    initialValue: PropTypes.object.def({}),
    showFilterCollapse: PropTypes.bool.def(true),
    table: PropTypes.shape({
      fetch: PropTypes.object.isRequired,
      columns: PropTypes.array.def([]),
      rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).def('uid'),
      webPagination: PropTypes.bool.def(false),
    }),
    fieldAliasMap: PropTypes.func.def(noop),
    beforeFetch: PropTypes.func,
    dataIndex: PropTypes.string,
    callback: PropTypes.func,
    fieldsDefine: PropTypes.object.def({}), // tds
    getServerConfig: PropTypes.func, // tds
  },
  data() {
    const { fetch, webPagination = !1 } = this.table;
    return {
      showTable: false,
      result: null,
      topFilters: this.createTopFilters(),
      height: 300,
      columns: this.createTableColumns(),
      tableList: [],
      selection: {
        type: 'radio',
        defaultSelectFirstRow: !0,
        onChange: this.selectedRowChange,
      },
      fetch: {
        api: fetch.api,
        params: merge({}, fetch.params, this.formatParams(this.initialValue)),
        beforeFetch: fetch.beforeFetch || trueNoop,
        xhrAbort: fetch.xhrAbort || !1,
        dataKey: fetch.dataKey,
      },
      alias: this.fieldAliasMap() || {},
      webPagination,
      loading: false,
    };
  },
  computed: {
    $topFilter(): any {
      return this.$refs[`filter`];
    },
    disabled(): boolean {
      return !this.result;
    },
  },
  created() {
    this.getHelperConfig();
    this.getTableData();
  },
  mounted() {
    this.resizeEvent = addEventListener(window, 'resize', debounce(this.resizeEventHandle, 0));
    this.$nextTick(() => {
      this.fetch.params = merge({}, this.fetch.params, this.formatParams(this.$topFilter.form));
      this.showTable = true;
    });
    setTimeout(() => this.calcTableHeight());
  },
  beforeUnmount() {
    this.resizeEvent && this.resizeEvent.remove();
  },
  methods: {
    async getHelperConfig(): Promise<void> {
      if (!this.getServerConfig) return;
      if (!this.name) {
        return warn('SearchHelper', '从服务端获取配置信息的时候，`name` 为必选参数.');
      }
      this.loading = true;
      try {
        const res = await this.getServerConfig({ name: this.name });
        if (res.code === 200) {
          const { data } = res;
          // 设置 topFilters、columns
          this.topFilters = this.createTopFilters(data.filters);
          this.columns = this.createTableColumns(data.columns);
          // 设置 alias
          const target: AnyObject<string> = {};
          for (let key in this.fieldsDefine) {
            if (!DEFINE.includes(key)) continue;
            target[this.fieldsDefine[key]] = data[key];
          }
          this.alias = Object.assign({}, target);
        }
      } catch (e) {}
      this.loading = false;
    },
    createTableColumns(vals = []): Record<string, unknown>[] {
      return [
        {
          title: t('qm.searchHelper.orderIndex'),
          dataIndex: 'index',
          width: 80,
          render: (text: string): JSXNode => {
            return text + 1;
          },
        },
        ...(this.table.columns || []),
        ...vals.map((x) => {
          let dict: IDict[] = x.refListName ? this.createDictList(x.refListName) : [];
          return {
            ...x,
            sorter: true,
            filter: {
              type: x.type ?? 'text',
              items: dict,
            },
            dictItems: dict,
          };
        }),
      ];
    },
    createTopFilters(vals = []): Record<string, unknown>[] {
      return [
        ...(this.filters || []),
        ...vals.map((x) => {
          let option = x.refListName ? { options: { itemList: this.createDictList(x.refListName) } } : null;
          return {
            ...x,
            ...option,
          };
        }),
      ];
    },
    formatParams(val: AnyObject<unknown>): AnyObject<unknown> {
      const { name, getServerConfig, beforeFetch = (k) => k } = this;
      val = beforeFetch(val);
      // tds 搜索条件的参数规范
      if (name && isFunction(getServerConfig)) {
        val = { name, condition: val };
      }
      return val;
    },
    filterChangeHandle(val: AnyObject<unknown>): void {
      const params: AnyObject<unknown> = this.table.fetch?.params ?? {};
      val = this.formatParams(val);
      this.fetch.xhrAbort = !1;
      this.fetch.params = merge({}, params, val);
      // 内存分页，获取数据
      this.getTableData();
    },
    async getTableData(): Promise<void> {
      if (!this.webPagination || !this.fetch.api) return;
      if (!this.fetch.beforeFetch(this.fetch.params) || this.fetch.xhrAbort) return;
      // console.log(`ajax 请求参数：`, this.fetch.params);
      this.loading = true;
      const res = await this.fetch.api(this.fetch.params);
      if (res.code === 200) {
        this.tableList = get(res.data, this.fetch.dataKey) ?? (Array.isArray(res.data) ? res.data : []);
      }
      this.loading = false;
    },
    collapseHandle(): void {
      this.$nextTick(() => this.calcTableHeight());
    },
    selectedRowChange(keys: string[], rows: AnyObject<any>[]): void {
      this.result = rows.length ? rows[0] : null;
    },
    dbClickHandle(row: AnyObject<any>): void {
      this.result = row;
      this.confirmHandle();
    },
    rowEnterHandle(row: AnyObject<any>): void {
      if (!row) return;
      this.dbClickHandle(row);
    },
    confirmHandle(): void {
      const tableData = this.createTableData();
      if (this.callback) {
        Array.isArray(tableData) && this.callback(...tableData);
      }
      this.cancelHandle(this.result);
    },
    cancelHandle(data): void {
      this.$emit('close', false, data, this.alias);
    },
    createDictList(code: string): IDict[] {
      const { global } = this.$DESIGN;
      const dictKey: string = global['dict_key'] || 'doct';
      const $dict: Record<string, IDict[]> = JSON.parse(localStorage.getItem(dictKey)) || {};
      let res: IDict[] = [];
      if ($dict && Array.isArray($dict[code])) {
        res = $dict[code].map((x) => ({ text: x.text, value: x.value }));
      }
      return res;
    },
    createTableData(): [unknown, Record<string, unknown>] {
      if (!Object.keys(this.alias).length) return;
      let others: Record<string, unknown> = {};
      let current: unknown;
      for (let dataIndex in this.alias) {
        let dataKey: string = this.alias[dataIndex];
        if (dataIndex !== this.dataIndex) {
          others[dataIndex] = this.result[dataKey];
        } else {
          current = this.result[dataKey];
        }
      }
      return [current, others];
    },
    calcTableHeight(): void {
      const $size: string = this.$props.size || this.$DESIGN.size || 'default';
      const containerHeight: number = window.innerHeight - getParentNode(this.$el, 'el-dialog')?.offsetTop * 2 - 50 - footHeight[$size];
      this.height = containerHeight - this.$topFilter.$el.offsetHeight - 94;
    },
    resizeEventHandle(): void {
      this.calcTableHeight();
    },
  },
  render(): JSXNode {
    const {
      showTable,
      loading,
      initialValue,
      topFilters,
      showFilterCollapse,
      height,
      columns,
      selection,
      tableList,
      fetch,
      webPagination,
      disabled,
    } = this;
    const tableProps = { props: !webPagination ? { fetch } : { dataSource: tableList, webPagination: !0 } };

    return (
      <div>
        {/* @ts-ignore */}
        <Spin spinning={loading} tip="Loading...">
          <Form
            ref="filter"
            // @ts-ignore
            formType="search"
            initialValue={initialValue}
            list={topFilters}
            isCollapse={showFilterCollapse}
            onChange={this.filterChangeHandle}
            onCollapseChange={this.collapseHandle}
          />
          {showTable ? (
            <Table
              {...tableProps}
              // @ts-ignore
              height={height}
              columns={columns}
              rowKey={this.table.rowKey}
              rowSelection={selection}
              columnsChange={(columns) => (this.columns = columns)}
              onRowEnter={this.rowEnterHandle}
              onRowDblclick={this.dbClickHandle}
            />
          ) : null}
        </Spin>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <el-button onClick={() => this.cancelHandle()}>{t('qm.searchHelper.close')}</el-button>
          <el-button type="primary" onClick={() => this.confirmHandle()} disabled={disabled}>
            {t('qm.searchHelper.confirm')}
          </el-button>
        </div>
      </div>
    );
  },
});
