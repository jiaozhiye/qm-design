/*
 * @Author: 焦质晔
 * @Date: 2020-03-09 13:18:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 13:52:52
 */
import { isEmpty } from '../../../_utils/util';
import { validateNumber, stringToNumber } from '../utils';
import { cloneDeep } from 'lodash';

import Radio from '../radio';
import Checkbox from '../checkbox';
import { JSXNode } from '../../../_utils/types';

export default {
  name: 'THeadFilter',
  props: ['column', 'filters'],
  inject: ['$$table', '$$header'],
  data() {
    return {
      visible: false,
      filterValues: this.initialFilterValue(),
    };
  },
  computed: {
    size() {
      return this.$$table.tableSize !== 'mini' ? 'small' : 'mini';
    },
    dataKey() {
      const { dataIndex, filter } = this.column;
      return Object.keys(this.filterValues)[0] || `${filter.type}|${dataIndex}`;
    },
    isFilterEmpty() {
      let res = !0; // 假设是空
      for (let key in this.filterValues[this.dataKey]) {
        if (!isEmpty(this.filterValues[this.dataKey][key])) {
          res = !1;
          break;
        }
      }
      return res;
    },
    isActived() {
      let res = !1; // 假设非激活状态
      for (let key in this.filters[this.dataKey]) {
        if (!isEmpty(this.filters[this.dataKey][key])) {
          res = !0;
          break;
        }
      }
      return res;
    },
  },
  watch: {
    filters() {
      // 非激活状态(此筛选项数据为空) -> 恢复初始值
      if (!this.isActived) {
        this.filterValues = this.initialFilterValue();
      }
    },
    visible(val) {
      if (!val) return;
      const { type } = this.column.filter;
      if (type === 'text' || type === 'number') {
        setTimeout(() => {
          this.$refs[`${type}-${this.dataKey}`]?.focus();
        });
      }
    },
  },
  methods: {
    initialFilterValue() {
      const { dataIndex, filter } = this.column;
      return { [`${filter.type}|${dataIndex}`]: undefined };
    },
    popperVisibleHandle(visible) {
      const { dataKey } = this;
      if (visible && this.filters[dataKey]) {
        this.filterValues[dataKey] = cloneDeep(this.filters[dataKey]);
      }
    },
    doFinish() {
      const { dataKey } = this;
      // 筛选值为空，移除该筛选属性
      if (this.isFilterEmpty) {
        delete this.filters[dataKey];
        delete this.filterValues[dataKey];
      } else {
        for (let key in this.filterValues[dataKey]) {
          if (isEmpty(this.filterValues[dataKey][key])) {
            delete this.filterValues[dataKey][key];
          }
        }
      }
      // 清空高级检索
      this.$$table.clearSuperSearch();
      // 设置父组件 filters 值
      this.$$header.filters = Object.assign({}, cloneDeep(this.filters), cloneDeep(this.filterValues));
      this.$refs[`vPopper`].doClose();
    },
    doReset() {
      if (this.isFilterEmpty && !this.isActived) {
        return this.$refs[`vPopper`].doClose();
      }
      // 恢复初始值
      this.filterValues = this.initialFilterValue();
      this.doFinish();
    },
    renderContent() {
      const { type } = this.column.filter;
      const renderFormItem = this[`${type}Handle`];
      if (!renderFormItem) {
        console.error('[Table]: 表头筛选的类型 `type` 配置不正确');
        return null;
      }
      return (
        <div class="v-filter--wrap">
          {renderFormItem(this.column)}
          {this.renderFormButton()}
        </div>
      );
    },
    renderFormButton() {
      return (
        <div style="padding: 10px 0 6px">
          <el-button type="primary" size="mini" onClick={this.doFinish}>
            {this.t('table.filter.search')}
          </el-button>
          <el-button size="mini" onClick={this.doReset}>
            {this.t('table.filter.reset')}
          </el-button>
        </div>
      );
    },
    textHandle(column) {
      const { title } = column;
      const { dataKey } = this;
      return (
        <div style="padding-top: 6px">
          <el-input
            ref={`text-${dataKey}`}
            size={this.size}
            value={this.filterValues[dataKey]?.[`like`]}
            onInput={(val) => {
              this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`like`]: val });
            }}
            placeholder={this.t('table.filter.searchText', { text: title })}
            style={{ width: '180px' }}
            nativeOnKeydown={(ev) => {
              if (ev.keyCode === 13) {
                this.doFinish();
              }
            }}
          />
        </div>
      );
    },
    numberHandle(column) {
      const { dataKey } = this;
      return (
        <div>
          <ul class="v-filter-list">
            <li>
              <span>&gt;&nbsp;</span>
              <el-input
                ref={`number-${dataKey}`}
                size={this.size}
                value={this.filterValues[dataKey]?.[`>`]}
                onInput={(val) => {
                  if (!validateNumber(val)) return;
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`>`]: val });
                }}
                placeholder={this.t('table.filter.gtPlaceholder')}
                style={{ width: '120px' }}
                onChange={(val) => {
                  this.filterValues[dataKey]['>'] = stringToNumber(val);
                }}
                nativeOnKeydown={(ev) => {
                  if (ev.keyCode === 13) {
                    this.filterValues[dataKey]['>'] = stringToNumber(ev.target.value);
                    this.doFinish();
                  }
                }}
              />
            </li>
            <li>
              <span>&lt;&nbsp;</span>
              <el-input
                size={this.size}
                value={this.filterValues[dataKey]?.[`<`]}
                onInput={(val) => {
                  if (!validateNumber(val)) return;
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`<`]: val });
                }}
                placeholder={this.t('table.filter.ltPlaceholder')}
                style={{ width: '120px' }}
                onChange={(val) => {
                  this.filterValues[dataKey]['<'] = stringToNumber(val);
                }}
                nativeOnKeydown={(ev) => {
                  if (ev.keyCode === 13) {
                    this.filterValues[dataKey]['<'] = stringToNumber(ev.target.value);
                    this.doFinish();
                  }
                }}
              />
            </li>
            <li>
              <span>=&nbsp;</span>
              <el-input
                size={this.size}
                value={this.filterValues[dataKey]?.[`==`]}
                onInput={(val) => {
                  if (!validateNumber(val)) return;
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`==`]: val });
                }}
                placeholder={this.t('table.filter.eqPlaceholder')}
                style={{ width: '120px' }}
                onChange={(val) => {
                  this.filterValues[dataKey]['=='] = stringToNumber(val);
                }}
                nativeOnKeydown={(ev) => {
                  if (ev.keyCode === 13) {
                    this.filterValues[dataKey]['=='] = stringToNumber(ev.target.value);
                    this.doFinish();
                  }
                }}
              />
            </li>
            <li>
              <span>!=</span>
              <el-input
                size={this.size}
                value={this.filterValues[dataKey]?.[`!=`]}
                onInput={(val) => {
                  if (!validateNumber(val)) return;
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`!=`]: val });
                }}
                placeholder={this.t('table.filter.neqPlaceholder')}
                style={{ width: '120px' }}
                onChange={(val) => {
                  this.filterValues[dataKey]['!='] = stringToNumber(val);
                }}
                nativeOnKeydown={(ev) => {
                  if (ev.keyCode === 13) {
                    this.filterValues[dataKey]['!='] = stringToNumber(ev.target.value);
                    this.doFinish();
                  }
                }}
              />
            </li>
          </ul>
        </div>
      );
    },
    radioHandle(column) {
      const { filter } = column;
      const { dataKey } = this;
      return (
        <div>
          <ul class="v-filter-list">
            {filter.items.map((x) => {
              const radioProps = {
                modelValue: this.filterValues[dataKey]?.[`==`] ?? null,
                'onUpdate:modelValue': (val) => {
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`==`]: val });
                },
              };
              return (
                <li>
                  <Radio {...radioProps} trueValue={x.value} falseValue={null} label={x.text} disabled={x.disabled} />
                </li>
              );
            })}
          </ul>
        </div>
      );
    },
    checkboxHandle(column) {
      const {
        filter: { items = [] },
      } = column;
      const { dataKey } = this;
      const results = this.filterValues[dataKey]?.[`in`] ?? [];
      return (
        <div>
          <ul class="v-filter-list">
            {items.map((x) => {
              const prevValue = results.includes(x.value) ? x.value : null;
              const checkboxProps = {
                modelValue: prevValue,
                'onUpdate:modelValue': (val) => {
                  const arr = val !== null ? [...new Set([...results, val])] : results.filter((x) => x !== prevValue);
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`in`]: arr });
                },
              };
              return (
                <li>
                  <Checkbox {...checkboxProps} trueValue={x.value} falseValue={null} label={x.text} disabled={x.disabled} />
                </li>
              );
            })}
          </ul>
        </div>
      );
    },
    dateHandle(column) {
      const { dataKey } = this;
      return (
        <div>
          <ul class="v-filter-list">
            <li>
              <span>&gt;&nbsp;</span>
              <el-date-picker
                size={this.size}
                type="date"
                value={this.filterValues[dataKey]?.[`>`]}
                valueFormat="yyyy-MM-dd"
                onInput={(val) => {
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`>`]: val ?? '' });
                }}
                placeholder={this.t('table.filter.gtPlaceholder')}
                style={{ width: '150px' }}
              />
            </li>
            <li>
              <span>&lt;&nbsp;</span>
              <el-date-picker
                size={this.size}
                type="date"
                value={this.filterValues[dataKey]?.[`<`]}
                valueFormat="yyyy-MM-dd"
                onInput={(val) => {
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`<`]: val ?? '' });
                }}
                placeholder={this.t('table.filter.ltPlaceholder')}
                style={{ width: '150px' }}
              />
            </li>
            <li>
              <span>=&nbsp;</span>
              <el-date-picker
                size={this.size}
                type="date"
                value={this.filterValues[dataKey]?.[`==`]}
                valueFormat="yyyy-MM-dd"
                onInput={(val) => {
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`==`]: val ?? '' });
                }}
                placeholder={this.t('table.filter.eqPlaceholder')}
                style={{ width: '150px' }}
              />
            </li>
            <li>
              <span>!=</span>
              <el-date-picker
                size={this.size}
                type="date"
                value={this.filterValues[dataKey]?.[`!=`]}
                valueFormat="yyyy-MM-dd"
                onInput={(val) => {
                  this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`!=`]: val ?? '' });
                }}
                placeholder={this.t('table.filter.neqPlaceholder')}
                style={{ width: '150px' }}
              />
            </li>
          </ul>
        </div>
      );
    },
  },
  render() {
    const { visible, isActived } = this;
    const filterBtnCls = [
      `v-filter-btn`,
      {
        [`selected`]: visible,
        [`actived`]: isActived,
      },
    ];
    return (
      <div class="v-cell--filter" title={this.t('table.filter.text')}>
        <el-popover
          v-model={[this.visible, 'visible']}
          trigger="manual"
          placement="bottom-start"
          transition="el-zoom-in-top"
          show-arrow={false}
          append-to-body={true}
          stop-popper-mouse-event={false}
          gpu-acceleration={false}
          onShow={(): void => {
            this.popperVisibleHandle(true);
          }}
          v-slots={{
            reference: (): JSXNode => (
              <div class={filterBtnCls}>
                <SvgIcon class="icon-filter" icon-class="filter" />
              </div>
            ),
          }}
        >
          <div>{this.renderContent()}</div>
        </el-popover>
      </div>
    );
  },
};
