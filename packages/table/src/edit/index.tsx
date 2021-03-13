/*
 * @Author: 焦质晔
 * @Date: 2020-03-22 14:34:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-13 12:47:59
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { isEqual, isFunction, isObject, get, merge } from 'lodash-es';
import { getCellValue, setCellValue, deepFindColumn, toDate, dateFormat } from '../utils';
import { noop } from '../../../_utils/util';
import { t } from '../../../locale';
import { warn } from '../../../_utils/error';
import { JSXNode } from '../../../_utils/types';

import Checkbox from '../checkbox';
import InputText from './InputText';
import InputNumber from './InputNumber';
import SearchHelper from '../../../search-helper';
import Dialog from '../../../dialog';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'CellEdit',
  props: ['column', 'record', 'rowKey', 'columnKey', 'clicked'],
  inject: ['$$table', '$$body'],
  data() {
    return {
      shVisible: false, // 是否显示搜索帮助面板
      shMatching: false, // 是否正在匹配数据回显
    };
  },
  computed: {
    store() {
      return this.$$table.store;
    },
    size() {
      return this.$$table.tableSize !== 'mini' ? 'small' : 'mini';
    },
    options() {
      return this.column.editRender(this.record, this.column);
    },
    editable() {
      const { editable, disabled } = this.options;
      return (editable || isEqual(this.clicked, [this.rowKey, this.columnKey])) && !disabled;
    },
    dataKey() {
      return `${this.rowKey}|${this.columnKey}`;
    },
    currentKey() {
      return this.clicked.length === 2 ? `${this.clicked[0]}|${this.clicked[1]}` : '';
    },
    passValidate() {
      return ![...this.store.state.required, ...this.store.state.validate].some(({ x, y }) => x === this.rowKey && y === this.columnKey);
    },
    requiredText() {
      return this.store.state.required.find(({ x, y }) => x === this.rowKey && y === this.columnKey)?.text;
    },
    validateText() {
      return this.store.state.validate.find(({ x, y }) => x === this.rowKey && y === this.columnKey)?.text;
    },
    isEditing() {
      return this.editable || !this.passValidate || this.shVisible || this.shMatching;
    },
  },
  watch: {
    clicked() {
      if (!this.editable) return;
      const { type } = this.options;
      const { currentKey } = this;
      if ((type === 'text' || type === 'number' || type === 'search-helper') && currentKey) {
        setTimeout(() => {
          this.$refs[`${type}-${currentKey}`]?.select();
        });
      }
    },
  },
  methods: {
    createFieldValidate(rules, val) {
      const { rowKey, columnKey } = this;
      this.$$table.createFieldValidate(rules, val, rowKey, columnKey);
    },
    textHandle(row, column) {
      const { dataIndex } = column;
      const { extra = {}, rules = [], onInput = noop, onChange = noop, onEnter = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <InputText
          ref={`text-${this.dataKey}`}
          size={this.size}
          {...inputProps}
          maxlength={extra.maxlength}
          onInput={(val) => {
            onInput({ [this.dataKey]: val }, row);
          }}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.$refs[`text-${this.dataKey}`].blur();
              setTimeout(() => onEnter({ [this.dataKey]: ev.target.value }, row));
            }
          }}
          disabled={extra.disabled}
        />
      );
    },
    numberHandle(row, column) {
      const { dataIndex, precision } = column;
      const { extra = {}, rules = [], onInput = noop, onChange = noop, onEnter = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <InputNumber
          ref={`number-${this.dataKey}`}
          size={this.size}
          {...inputProps}
          precision={precision}
          min={extra.min}
          max={extra.max}
          maxlength={extra.maxlength}
          style={{ width: '100%' }}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          onKeydown={(ev) => {
            if (ev.keyCode === 13) {
              this.$refs[`number-${this.dataKey}`].blur();
              setTimeout(() => onEnter({ [this.dataKey]: ev.target.value }, row));
            }
          }}
          disabled={extra.disabled}
        />
      );
    },
    selectHandle(row, column, isMultiple) {
      const { dataIndex } = column;
      const { extra = {}, rules = [], items = [], onChange = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const selectProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <el-select
          size={this.size}
          {...selectProps}
          multiple={isMultiple}
          collapseTags={isMultiple}
          placeholder={t('qm.table.editable.selectPlaceholder')}
          clearable={extra.clearable ?? !0}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
        >
          {items.map((x) => (
            <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
          ))}
        </el-select>
      );
    },
    [`select-multipleHandle`](row, column) {
      return this.selectHandle(row, column, !0);
    },
    dateHandle(row, column, isDateTime) {
      const { dataIndex } = column;
      const { extra = {}, rules = [], onChange = noop } = this.options;
      const prevValue = getCellValue(row, dataIndex);
      const dateProps = {
        modelValue: toDate(prevValue),
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, dateFormat(val, !isDateTime ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss'));
        },
      };
      return (
        <el-date-picker
          size={this.size}
          type={!isDateTime ? 'date' : 'datetime'}
          {...dateProps}
          style={{ width: '100%' }}
          disabledDate={(oDate) => {
            return this.setDisabledDate(oDate, [extra.minDateTime, extra.maxDateTime]);
          }}
          clearable={extra.clearable ?? !0}
          placeholder={!isDateTime ? t('qm.table.editable.datePlaceholder') : t('qm.table.editable.datetimePlaceholder')}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
        />
      );
    },
    datetimeHandle(row, column) {
      return this.dateHandle(row, column, !0);
    },
    timeHandle(row, column) {
      const { dataIndex } = column;
      const { extra = {}, rules = [], onChange = noop } = this.options;
      const timeFormat = 'HH:mm:ss';
      const prevValue = getCellValue(row, dataIndex);
      const timeProps = {
        modelValue: toDate(prevValue),
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, dateFormat(val, `YYYY-MM-DD ${timeFormat}`));
        },
      };
      return (
        <el-time-picker
          size={this.size}
          {...timeProps}
          format={timeFormat}
          style={{ width: '100%' }}
          clearable={extra.clearable ?? !0}
          placeholder={t('qm.table.editable.datetimePlaceholder')}
          onChange={(val) => {
            this.createFieldValidate(rules, val);
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={extra.disabled}
        />
      );
    },
    checkboxHandle(row, column) {
      const { dataIndex } = column;
      const { extra = {}, onChange = noop } = this.options;
      const { trueValue = '1', falseValue = '0', text = '', disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      const checkboxProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <Checkbox
          {...checkboxProps}
          onChange={(val) => {
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          trueValue={trueValue}
          falseValue={falseValue}
          label={text}
          disabled={disabled}
        />
      );
    },
    switchHandle(row, column) {
      const { dataIndex } = column;
      const { extra = {}, onChange = noop } = this.options;
      const { trueValue = '1', falseValue = '0', disabled } = extra;
      const prevValue = getCellValue(row, dataIndex);
      const switchProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <el-switch
          size={this.size}
          {...switchProps}
          activeValue={trueValue}
          inactiveValue={falseValue}
          onChange={(val) => {
            this.store.addToUpdated(row);
            onChange({ [this.dataKey]: val }, row);
            this.$$table.dataChangeHandle();
          }}
          disabled={disabled}
        />
      );
    },
    [`search-helperHandle`](row, column) {
      const { dataIndex, precision } = column;
      const { extra = {}, helper, rules = [], onClick = noop, onChange = noop } = this.options;
      const createFieldAliasMap = () => {
        if (!isFunction(helper.fieldAliasMap)) {
          warn('Table', '单元格的搜索帮助 `fieldAliasMap` 配置不正确');
        }
        const { fieldAliasMap = noop } = helper;
        return Object.assign({}, fieldAliasMap());
      };
      const setHelperValues = (val = '', others?: any) => {
        // 对其他单元格赋值 & 校验
        if (isObject(others) && Object.keys(others).length) {
          for (let otherDataIndex in others) {
            const otherValue = others[otherDataIndex];
            const otherColumn = deepFindColumn(this.$$table.columns, otherDataIndex);
            setCellValue(row, otherDataIndex, otherValue, otherColumn?.precision);
            const otherOptions = otherColumn?.editRender?.(row, otherColumn);
            if (!Array.isArray(otherOptions?.rules)) continue;
            this.$$table.createFieldValidate(otherOptions.rules, otherValue, this.rowKey, otherDataIndex);
          }
        }
        // 修改当前单元格的值
        setCellValue(row, dataIndex, val, precision);
        this.createFieldValidate(rules, val);
        this.store.addToUpdated(row);
        onChange({ [this.dataKey]: val }, row);
        this.$$table.dataChangeHandle();
      };
      const closeHelperHandle = (visible, data) => {
        if (isObject(data)) {
          const alias = createFieldAliasMap();
          // 其他字段的集合
          const others = {};
          for (let key in alias) {
            const dataKey = alias[key];
            if (key === dataIndex) continue;
            others[key] = data[dataKey];
          }
          const current = alias[dataIndex] ? data[alias[dataIndex]] : '';
          // 关闭的前置钩子
          const beforeClose = helper.beforeClose ?? helper.close ?? trueNoop;
          const before = beforeClose(data, { [this.dataKey]: prevValue }, row, column);
          if (before?.then) {
            before
              .then(() => {
                this.shVisible = visible;
                setHelperValues(current, others);
              })
              .catch(() => {});
          } else if (before !== false) {
            this.shVisible = visible;
            setHelperValues(current, others);
          }
        } else {
          this.shVisible = visible;
        }
      };
      const setHelperFilterValues = (val) => {
        const { filterAliasMap = noop } = helper;
        const alias = Object.assign([], filterAliasMap());
        const inputParams = { [dataIndex]: val };
        alias.forEach((x) => (inputParams[x] = val));
        return inputParams;
      };
      const getHelperData = (val) => {
        const { table, initialValue = {}, beforeFetch = (k) => k } = helper;
        return new Promise(async (resolve, reject) => {
          this.shMatching = !0;
          const params = merge({}, table.fetch?.params, beforeFetch({ ...initialValue, ...setHelperFilterValues(val) }), {
            currentPage: 1,
            pageSize: 500,
          });
          try {
            const res = await table.fetch.api(params);
            if (res.code === 200) {
              const list = get(res.data, table.fetch.dataKey) ?? (Array.isArray(res.data) ? res.data : []);
              resolve(list);
            } else {
              reject();
            }
          } catch (err) {
            reject();
          }
          this.shMatching = !1;
        });
      };
      const resetHelperValue = (list = [], val) => {
        const alias = createFieldAliasMap();
        const records = list.filter((data) => {
          return getCellValue(data, alias[dataIndex]).toString().includes(val);
        });
        if (records.length === 1) {
          return closeHelperHandle(false, records[0]);
        }
        openHelperPanel();
        setHelperValues('');
        this.$nextTick(() => {
          this.$refs[`sh-panel-${this.dataKey}`]?.$refs[`top-filter`]?.SET_FORM_VALUES(setHelperFilterValues(val));
        });
      };
      const openHelperPanel = () => {
        // 打开的前置钩子
        const beforeOpen = helper.beforeOpen ?? helper.open ?? trueNoop;
        const before = beforeOpen({ [this.dataKey]: prevValue }, row, column);
        if (before?.then) {
          before
            .then(() => {
              this.shVisible = !0;
            })
            .catch(() => {});
        } else if (before !== false) {
          this.shVisible = !0;
        }
      };
      const dialogProps = {
        visible: this.shVisible,
        title: t('qm.table.editable.searchHelper'),
        width: helper?.width ?? '60%',
        height: helper?.height,
        loading: false,
        destroyOnClose: true,
        containerStyle: { paddingBottom: '52px' },
        'onUpdate:visible': (val) => {
          this.shVisible = val;
        },
        onClosed: () => {
          const { closed = noop } = helper;
          closed(row);
        },
      };
      const shProps = {
        ref: `sh-panel-${this.dataKey}`,
        ...helper,
        onClose: closeHelperHandle,
      };
      const prevValue = getCellValue(row, dataIndex);
      const remoteMatch = helper && (helper.remoteMatch ?? !0);
      const inputProps = {
        modelValue: prevValue,
        'onUpdate:modelValue': (val) => {
          setCellValue(row, dataIndex, val);
        },
      };
      return (
        <div class="search-helper">
          <InputText
            ref={`search-helper-${this.dataKey}`}
            size={this.size}
            {...inputProps}
            maxlength={extra.maxlength}
            readonly={extra.readonly}
            clearable={extra.clearable ?? !0}
            disabled={extra.disabled}
            onChange={(val) => {
              if (val && remoteMatch) {
                return getHelperData(val)
                  .then((list: unknown[]) => resetHelperValue(list, val))
                  .catch(() => setHelperValues(''));
              }
              setHelperValues(val);
            }}
            onDblclick={() => {
              if (extra.disabled) return;
              isObject(helper) && openHelperPanel();
            }}
            onKeydown={(ev) => {
              if (ev.keyCode === 13) {
                this.$refs[`search-helper-${this.dataKey}`].blur();
              }
            }}
            v-slots={{
              append: (): JSXNode => (
                <el-button
                  size={this.size}
                  icon="el-icon-search"
                  onClick={(ev) => {
                    isObject(helper) ? openHelperPanel() : onClick({ [this.dataKey]: prevValue }, row, column, setHelperValues, ev);
                  }}
                />
              ),
            }}
          />
          {isObject(helper) && (
            <Dialog {...dialogProps}>
              <SearchHelper {...shProps} />
            </Dialog>
          )}
        </div>
      );
    },
    // 设置日期控件的禁用状态
    setDisabledDate(oDate, [minDateTime, maxDateTime]) {
      const min = minDateTime ? dayjs(minDateTime).toDate().getTime() : 0;
      const max = maxDateTime ? dayjs(maxDateTime).toDate().getTime() : 0;
      if (min && max) {
        return !(oDate.getTime() >= min && oDate.getTime() <= max);
      }
      if (!!min) {
        return oDate.getTime() < min;
      }
      if (!!max) {
        return oDate.getTime() > max;
      }
      return false;
    },
    renderEditCell() {
      const { type } = this.options;
      const render = this[`${type}Handle`];
      if (!render) {
        warn('Table', '单元格编辑的类型 `type` 配置不正确');
        return null;
      }
      const { passValidate, requiredText, validateText } = this;
      const cls = [
        `cell--edit`,
        {
          [`is-error`]: !passValidate,
        },
      ];
      return (
        <div class={cls}>
          {render(this.record, this.column)}
          {!passValidate && <div class="cell-error">{requiredText || validateText}</div>}
        </div>
      );
    },
    renderCell() {
      const { record, column } = this;
      const text = getCellValue(record, column.dataIndex);
      return <span class="cell--text">{this.$$body.renderText(text, column, record)}</span>;
    },
  },
  render(): JSXNode {
    return this.isEditing ? this.renderEditCell() : this.renderCell();
  },
});
