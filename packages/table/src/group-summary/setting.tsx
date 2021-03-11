/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 16:19:58
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 10:44:32
 */
import { defineComponent } from 'vue';
import localforage from 'localforage';
import { createUidKey } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { warn } from '../../../_utils/error';
import { t } from '../../../locale';

import config from '../config';
import VTable from '../table';
import EmptyEle from '../empty/element';
import GroupSummaryResult from './result';
import Dialog from '../../../dialog';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'GroupSummarySetting',
  props: ['columns'],
  inject: ['$$table'],
  data() {
    // 分组项 字典
    this.groupItems = this.columns.filter((x) => !x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex }));
    // 汇总列 字典
    this.summaryItems = [
      config.groupSummary.total,
      ...this.columns.filter((x) => !!x.groupSummary).map((x) => ({ text: x.title, value: x.dataIndex })),
    ];
    // 计算公式 字典
    this.formulaItems = [
      { text: t('qm.table.groupSummary.sumText'), value: 'sum' },
      { text: t('qm.table.groupSummary.maxText'), value: 'max' },
      { text: t('qm.table.groupSummary.minText'), value: 'min' },
      { text: t('qm.table.groupSummary.avgText'), value: 'avg' },
      { text: t('qm.table.groupSummary.countText'), value: 'count' },
    ];
    return {
      savedItems: [],
      currentKey: '',
      form: { name: '' },
      groupList: [],
      groupColumns: this.createGroupColumns(),
      summaryList: [],
      summaryColumns: this.createSummaryColumns(),
      groupTableData: [], // 分组项表格数据
      summaryTableData: [], // 汇总表格数据
      visible: false,
    };
  },
  computed: {
    $tableGroup() {
      return this.$refs.group;
    },
    $tableSummary() {
      return this.$refs.summary;
    },
    groupSummaryKey() {
      return this.$$table.uniqueKey ? `summary_${this.$$table.uniqueKey}` : '';
    },
    confirmDisabled() {
      const { groupTableData, summaryTableData } = this;
      const isGroup = groupTableData.length && groupTableData.every((x) => Object.values(x).every((k) => k !== ''));
      const isSummary = summaryTableData.length && summaryTableData.every((x) => Object.values(x).every((k) => k !== ''));
      return !(isGroup && isSummary);
    },
  },
  watch: {
    currentKey(next) {
      if (next) {
        const { group, summary } = this.savedItems.find((x) => x.value === next).list;
        this.groupList = group;
        this.summaryList = summary;
      } else {
        this.groupList = [];
        this.summaryList = [];
      }
    },
  },
  async created() {
    if (!this.groupSummaryKey) return;
    let res = await localforage.getItem(this.groupSummaryKey);
    if (!res) {
      res = await this.getGroupSummaryConfig(this.groupSummaryKey);
      if (Array.isArray(res)) {
        await localforage.setItem(this.groupSummaryKey, res);
      }
    }
    if (Array.isArray(res) && res.length) {
      this.savedItems = res;
      this.currentKey = res[0].value;
    }
  },
  methods: {
    findColumn(columns, dataIndex) {
      return columns.find((x) => x.dataIndex === dataIndex);
    },
    createGroupColumns() {
      return [
        {
          title: '操作',
          dataIndex: '__action__',
          fixed: 'left',
          width: 80,
          render: (text, row) => {
            return (
              <div>
                <el-button
                  type="text"
                  onClick={() => {
                    this.$tableGroup.REMOVE_RECORDS(row);
                  }}
                >
                  {t('qm.table.groupSummary.removeText')}
                </el-button>
              </div>
            );
          },
        },
        {
          dataIndex: 'group',
          title: '分组项',
          width: 200,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.setGroupDisabled(),
              extra: {
                clearable: false,
              },
            };
          },
        },
      ];
    },
    createSummaryColumns() {
      return [
        {
          title: '操作',
          dataIndex: '__action__',
          fixed: 'left',
          width: 80,
          render: (text, row) => {
            return (
              <div>
                <el-button
                  type="text"
                  onClick={() => {
                    this.$tableSummary.REMOVE_RECORDS(row);
                  }}
                >
                  {t('qm.table.groupSummary.removeText')}
                </el-button>
              </div>
            );
          },
        },
        {
          dataIndex: 'summary',
          title: '汇总列',
          width: 200,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: this.setSummaryDisabled(),
              extra: {
                clearable: false,
              },
              onChange: (cell, row) => {
                row[`formula`] = '';
              },
            };
          },
        },
        {
          dataIndex: 'formula',
          title: '计算公式',
          width: 150,
          editRender: (row) => {
            return {
              type: 'select',
              editable: true,
              items: row.summary === config.groupSummary.total.value ? this.formulaItems.slice(this.formulaItems.length - 1) : this.formulaItems,
              extra: {
                clearable: false,
              },
            };
          },
        },
      ];
    },
    setGroupDisabled() {
      return this.groupItems.map((x) => ({
        ...x,
        disabled: this.groupTableData.findIndex((k) => k.group === x.value) > -1,
      }));
    },
    setSummaryDisabled() {
      return this.summaryItems.map((x) => ({
        ...x,
        disabled: this.summaryTableData.findIndex((k) => k.summary === x.value) > -1,
      }));
    },
    // 切换配置信息
    toggleHandle(key) {
      this.currentKey = key !== this.currentKey ? key : '';
    },
    // 保存配置
    async saveConfigHandle() {
      if (!this.groupSummaryKey) {
        return warn('Table', '必须设置组件参数 `uniqueKey` 才能保存');
      }
      const title = this.form.name;
      const uuid = createUidKey();
      this.savedItems.push({
        text: title,
        value: uuid,
        list: {
          group: this.groupTableData,
          summary: this.summaryTableData,
        },
      });
      this.currentKey = uuid;
      await localforage.setItem(this.groupSummaryKey, this.savedItems);
      await this.saveGroupSummaryConfig(this.groupSummaryKey, this.savedItems);
    },
    async getGroupSummaryConfig(key) {
      const { global } = this.$DESIGN;
      const fetchFn = global['getComponentConfigApi'];
      if (!fetchFn) return;
      try {
        const res = await fetchFn({ key });
        if (res.code === 200) {
          return res.data;
        }
      } catch (err) {}
      return null;
    },
    async saveGroupSummaryConfig(key, value) {
      const { global } = this.$DESIGN;
      const fetchFn = global['saveComponentConfigApi'];
      if (!fetchFn) return;
      try {
        await fetchFn({ [key]: value });
      } catch (err) {}
    },
    // 移除保存的 汇总配置项
    async removeSavedHandle(ev, key) {
      ev.stopPropagation();
      if (!key) return;
      const index = this.savedItems.findIndex((x) => x.value === key);
      this.savedItems.splice(index, 1);
      if (key === this.currentKey) {
        this.currentKey = '';
      }
      await localforage.setItem(this.groupSummaryKey, this.savedItems);
      await this.saveGroupSummaryConfig(this.groupSummaryKey, this.savedItems);
    },
    // 关闭
    cancelHandle() {
      this.$emit('close', false);
    },
    // 显示汇总
    confirmHandle() {
      this.visible = true;
    },
  },
  render(): JSXNode {
    const {
      columns,
      groupList,
      groupColumns,
      summaryList,
      summaryColumns,
      form,
      savedItems,
      currentKey,
      confirmDisabled,
      visible,
      groupTableData,
      summaryTableData,
    } = this;
    const prefixCls = getPrefixCls('table');
    const wrapProps = {
      visible,
      title: t('qm.table.groupSummary.resultText'),
      width: '1000px',
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.visible = val;
      },
    };
    return (
      <div class={`${prefixCls}-group-summary__setting`}>
        <div class="main">
          <div class="container" style={{ width: '280px' }}>
            <VTable
              ref="group"
              height={300}
              dataSource={groupList}
              columns={groupColumns}
              showFullScreen={false}
              showColumnDefine={false}
              rowKey={(record) => record.index}
              columnsChange={(columns) => (this.groupColumns = columns)}
              onDataChange={(tableData) => {
                this.groupTableData = tableData;
              }}
            >
              <el-button
                type="primary"
                icon="el-icon-plus"
                onClick={() => this.$tableGroup.INSERT_RECORDS({})}
                style={{ marginLeft: '10px', marginRight: '-10px' }}
              />
            </VTable>
          </div>
          <div class="container line" style={{ width: '430px' }}>
            <VTable
              ref="summary"
              height={300}
              dataSource={summaryList}
              columns={summaryColumns}
              showFullScreen={false}
              showColumnDefine={false}
              rowKey={(record) => record.index}
              columnsChange={(columns) => (this.summaryColumns = columns)}
              onDataChange={(tableData) => {
                this.summaryTableData = tableData;
              }}
            >
              <el-button type="primary" icon="el-icon-plus" style={{ marginRight: '-10px' }} onClick={() => this.$tableSummary.INSERT_RECORDS({})} />
            </VTable>
          </div>
          <div class="saved line">
            <div class="form-wrap">
              <el-input
                class="form-item"
                placeholder={t('qm.table.groupSummary.configText')}
                value={form.name}
                disabled={confirmDisabled}
                onInput={(val) => (this.form.name = val)}
              />
              <el-button type="primary" disabled={!form.name} style={{ marginLeft: '10px' }} onClick={() => this.saveConfigHandle()}>
                {t('qm.table.groupSummary.saveButton')}
              </el-button>
            </div>
            <div class="card-wrap">
              <h5 style={{ height: `${config.rowHeightMaps[this.$$table.tableSize]}px` }}>
                <span>{t('qm.table.groupSummary.savedSetting')}</span>
              </h5>
              <ul>
                {savedItems.map((x) => (
                  <li class={x.value === currentKey && 'selected'} onClick={() => this.toggleHandle(x.value)}>
                    <span class="title">
                      <i class={['iconfont', x.value === currentKey ? 'icon-check' : 'icon-file']} />
                      <span>{x.text}</span>
                    </span>
                    <i
                      class="iconfont icon-close-circle close"
                      title={t('qm.table.groupSummary.removeText')}
                      onClick={(ev) => this.removeSavedHandle(ev, x.value)}
                    />
                  </li>
                ))}
                {!savedItems.length && (
                  <div style={{ padding: '10px' }}>
                    <EmptyEle />
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
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
          <el-button onClick={() => this.cancelHandle()}>{t('qm.table.groupSummary.closeButton')}</el-button>
          <el-button type="primary" disabled={confirmDisabled} onClick={() => this.confirmHandle()}>
            {t('qm.table.groupSummary.confirmButton')}
          </el-button>
        </div>
        <Dialog {...wrapProps}>
          <GroupSummaryResult columns={columns} group={groupTableData} summary={summaryTableData} />
        </Dialog>
      </div>
    );
  },
});
