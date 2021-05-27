/*
 * @Author: 焦质晔
 * @Date: 2020-03-09 13:18:43
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-27 21:55:04
 */
import { defineComponent } from 'vue';
import { cloneDeep } from 'lodash-es';
import classnames from 'classnames';
import { isEmpty } from '../../../_utils/util';
import { validateNumber, stringToNumber, toDate, dateFormat } from '../utils';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { JSXNode, Nullable } from '../../../_utils/types';
import { IColumn } from '../table/types';

import Radio from '../radio';
import Checkbox from '../checkbox';
import FilterIcon from '../icon/filter';

export default defineComponent({
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
    size(): string {
      return this.$$table.tableSize !== 'mini' ? 'small' : 'mini';
    },
    dataKey(): string {
      const { dataIndex, filter } = this.column;
      return Object.keys(this.filterValues)[0] || `${filter.type}|${dataIndex}`;
    },
    isFilterEmpty(): boolean {
      let res = !0; // 假设是空
      for (let key in this.filterValues[this.dataKey]) {
        if (!isEmpty(this.filterValues[this.dataKey][key])) {
          res = !1;
          break;
        }
      }
      return res;
    },
    isActived(): boolean {
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
    filters(): void {
      // 非激活状态(此筛选项数据为空) -> 恢复初始值
      if (!this.isActived) {
        this.filterValues = this.initialFilterValue();
      }
    },
    visible(val: boolean): void {
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
    initialFilterValue(): Record<string, unknown> {
      const { dataIndex, filter } = this.column;
      return { [`${filter.type}|${dataIndex}`]: undefined };
    },
    popperVisibleHandle(visible: boolean): void {
      const { dataKey } = this;
      if (visible && this.filters[dataKey]) {
        this.filterValues[dataKey] = cloneDeep(this.filters[dataKey]);
      }
    },
    doFinish(): void {
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
      this.visible = false;
    },
    doReset(): void {
      if (this.isFilterEmpty && !this.isActived) {
        this.visible = false;
        return;
      }
      // 恢复初始值
      this.filterValues = this.initialFilterValue();
      this.doFinish();
    },
    renderContent(): Nullable<JSXNode> {
      const { type } = this.column.filter;
      const renderFormItem = this[`${type}Handle`];
      if (!renderFormItem) {
        warn('Table', '表头筛选的类型 `type` 配置不正确');
        return null;
      }
      return (
        <div class="head-filter--wrap">
          {renderFormItem(this.column)}
          {this.renderFormButton()}
        </div>
      );
    },
    renderFormButton(): JSXNode {
      return (
        <dl style="margin-top: 10px">
          <el-button type="primary" size={this.size} onClick={this.doFinish}>
            {t('qm.table.filter.search')}
          </el-button>
          <el-button size={this.size} onClick={this.doReset}>
            {t('qm.table.filter.reset')}
          </el-button>
        </dl>
      );
    },
    textHandle(column: IColumn): JSXNode {
      const { title } = column;
      const { dataKey } = this;
      const inputProps = {
        modelValue: this.filterValues[dataKey]?.[`like`],
        'onUpdate:modelValue': (val) => {
          this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`like`]: val });
        },
      };
      return (
        <el-input
          ref={`text-${dataKey}`}
          size={this.size}
          {...inputProps}
          placeholder={t('qm.table.filter.searchText', { text: title })}
          style={{ width: '180px' }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.doFinish();
            }
          }}
        />
      );
    },
    textareaHandle(column: IColumn): JSXNode {
      const { title } = column;
      const { dataKey } = this;
      const inputProps = {
        modelValue: this.filterValues[dataKey]?.[`likes`],
        'onUpdate:modelValue': (val) => {
          this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`likes`]: val });
        },
      };
      return (
        <el-input
          ref={`textarea-${dataKey}`}
          size={this.size}
          type="textarea"
          rows={3}
          {...inputProps}
          placeholder={t('qm.table.filter.searchAreaText', { text: title })}
          style={{ width: '220px' }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.doFinish();
            }
          }}
        />
      );
    },
    numberHandle(column: IColumn): JSXNode {
      const { dataKey } = this;
      const inputPropsFn = (mark: string) => ({
        modelValue: this.filterValues[dataKey]?.[mark],
        'onUpdate:modelValue': (val) => {
          if (!validateNumber(val)) return;
          this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [mark]: val });
        },
        onChange: (val) => {
          this.filterValues[dataKey][mark] = stringToNumber(val);
        },
        onKeydown: (ev) => {
          if (ev.keyCode === 13) {
            this.filterValues[dataKey][mark] = stringToNumber(ev.target.value);
            this.doFinish();
          }
        },
      });
      return (
        <ul>
          <li>
            <span>&gt;&nbsp;</span>
            <el-input
              ref={`number-${dataKey}`}
              size={this.size}
              {...inputPropsFn('>')}
              placeholder={t('qm.table.filter.gtPlaceholder')}
              style={{ width: '120px' }}
            />
          </li>
          <li>
            <span>&lt;&nbsp;</span>
            <el-input size={this.size} {...inputPropsFn('<')} placeholder={t('qm.table.filter.ltPlaceholder')} style={{ width: '120px' }} />
          </li>
          <li>
            <span>=&nbsp;</span>
            <el-input size={this.size} {...inputPropsFn('==')} placeholder={t('qm.table.filter.eqPlaceholder')} style={{ width: '120px' }} />
          </li>
          <li>
            <span>!=</span>
            <el-input size={this.size} {...inputPropsFn('!=')} placeholder={t('qm.table.filter.neqPlaceholder')} style={{ width: '120px' }} />
          </li>
        </ul>
      );
    },
    radioHandle(column: IColumn): JSXNode {
      const { filter } = column;
      const { dataKey } = this;
      return (
        <ul>
          {filter?.items?.map((x) => {
            const radioProps = {
              modelValue: this.filterValues[dataKey]?.[`==`] ?? null,
              'onUpdate:modelValue': (val) => {
                this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`==`]: val });
              },
            };
            return (
              <li key={x.value}>
                <Radio {...radioProps} trueValue={x.value} falseValue={null} label={x.text} disabled={x.disabled} />
              </li>
            );
          })}
        </ul>
      );
    },
    checkboxHandle(column: IColumn): JSXNode {
      const { filter } = column;
      const { dataKey } = this;
      const results = this.filterValues[dataKey]?.[`in`] ?? [];
      return (
        <ul>
          {filter?.items?.map((x) => {
            const prevValue = results.includes(x.value) ? x.value : null;
            const checkboxProps = {
              modelValue: prevValue,
              'onUpdate:modelValue': (val) => {
                const arr = val !== null ? [...results, val] : results.filter((x) => x !== prevValue);
                this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [`in`]: arr });
              },
            };
            return (
              <li key={x.value}>
                <Checkbox {...checkboxProps} trueValue={x.value} falseValue={null} label={x.text} disabled={x.disabled} />
              </li>
            );
          })}
        </ul>
      );
    },
    dateHandle(column: IColumn): JSXNode {
      const { dataKey } = this;
      const datePropsFn = (mark: string) => ({
        modelValue: toDate(this.filterValues[dataKey]?.[mark]),
        'onUpdate:modelValue': (val) => {
          this.filterValues[dataKey] = Object.assign({}, this.filterValues[dataKey], { [mark]: dateFormat(val, 'YYYY-MM-DD') });
        },
      });
      return (
        <ul>
          <li>
            <span>&gt;&nbsp;</span>
            <el-date-picker
              size={this.size}
              type="date"
              {...datePropsFn('>')}
              placeholder={t('qm.table.filter.gtPlaceholder')}
              style={{ width: '150px' }}
            />
          </li>
          <li>
            <span>&lt;&nbsp;</span>
            <el-date-picker
              size={this.size}
              type="date"
              {...datePropsFn('<')}
              placeholder={t('qm.table.filter.ltPlaceholder')}
              style={{ width: '150px' }}
            />
          </li>
          <li>
            <span>=&nbsp;</span>
            <el-date-picker
              size={this.size}
              type="date"
              {...datePropsFn('==')}
              placeholder={t('qm.table.filter.eqPlaceholder')}
              style={{ width: '150px' }}
            />
          </li>
          <li>
            <span>!=</span>
            <el-date-picker
              size={this.size}
              type="date"
              {...datePropsFn('!=')}
              placeholder={t('qm.table.filter.neqPlaceholder')}
              style={{ width: '150px' }}
            />
          </li>
        </ul>
      );
    },
  },
  render(): JSXNode {
    const { tableSize } = this.$$table;
    const { visible, isActived } = this;
    const prefixCls = getPrefixCls('table');
    const popperCls = {
      [`${prefixCls}__popper`]: true,
      [`${prefixCls}__popper--medium`]: tableSize === 'medium',
      [`${prefixCls}__popper--small`]: tableSize === 'small',
      [`${prefixCls}__popper--mini`]: tableSize === 'mini',
    };
    const filterBtnCls = [
      `cell--filter__btn`,
      {
        [`selected`]: visible,
        [`actived`]: isActived,
      },
    ];
    return (
      <div class="cell--filter" title={t('qm.table.filter.text')}>
        <el-popover
          popper-class={`${classnames(popperCls)}`}
          v-model={[this.visible, 'visible']}
          width="auto"
          trigger="click"
          placement="bottom-end"
          transition="el-zoom-in-top"
          offset={4}
          show-arrow={false}
          append-to-body={true}
          stop-popper-mouse-event={false}
          gpu-acceleration={false}
          onShow={() => {
            this.popperVisibleHandle(true);
          }}
          v-slots={{
            reference: (): JSXNode => (
              <div class={filterBtnCls}>
                <span class="icon-svg">
                  <FilterIcon />
                </span>
              </div>
            ),
          }}
        >
          {this.visible && this.renderContent()}
        </el-popover>
      </div>
    );
  },
});
