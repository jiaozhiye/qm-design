/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-16 16:48:16
 */
import { defineComponent } from 'vue';
import { merge, get, isObject, isFunction } from 'lodash-es';
import { JSXNode, ValueOf, AnyFunction, AnyObject } from '../../_utils/types';
import { IFormData } from './types';

import { t } from '../../locale';
import { noop } from './utils';
import { getParserWidth } from '../../_utils/util';

import Dialog from '../../dialog';
import SearchHelper from '../../search-helper';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'FormInput',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  data() {
    Object.assign(this, { _is_change: false });
    return {
      visible: false,
      deriveValue: {},
      extraKeys: [],
      descKeys: [],
    };
  },
  methods: {
    reset(val?: string): void {
      this.extraKeys.forEach((key) => (this.$$form.form[key] = val));
      this.descKeys.forEach((key) => (this.$$form.desc[key] = val));
    },
    // 格式化搜索帮助接口参数 tds
    formatParams(val: AnyObject<unknown>): AnyObject<unknown> {
      const { name, fieldsDefine, getServerConfig, beforeFetch = (k) => k } = this.option.searchHelper;
      val = beforeFetch(val);
      // tds 搜索条件的参数规范
      if (name && fieldsDefine && getServerConfig) {
        val = { name, condition: val };
      }
      return val;
    },
    // 设置搜做帮助组件表单数据
    createFilters(val: string): AnyObject<string> {
      const { fieldName } = this.option;
      const { name, fieldsDefine, getServerConfig, filterAliasMap = noop } = this.option.searchHelper;
      const alias: string[] = Object.assign([], filterAliasMap());
      const inputParams: AnyObject<string> = name && fieldsDefine && getServerConfig ? {} : { [fieldName]: val };
      alias.forEach((x) => (inputParams[x] = val));
      return inputParams;
    },
    // 执行搜索帮助接口，获取数据
    getSearchHelperTableData(val: string): Promise<Record<string, unknown>[]> {
      const { table, initialValue = {} } = this.option.searchHelper;
      return new Promise(async (resolve, reject) => {
        const params: AnyObject<unknown> = merge(
          {},
          table.fetch?.params,
          this.formatParams({
            ...initialValue,
            ...this.createFilters(val),
          }),
          {
            currentPage: 1,
            pageSize: 500,
          }
        );
        try {
          const res = await table.fetch.api(params);
          if (res.code === 200) {
            const list: Record<string, unknown>[] = Array.isArray(res.data) ? res.data : get(res.data, table.fetch.dataKey) ?? [];
            return resolve(list);
          }
        } catch (err) {}
        reject();
      });
    },
    // 创建 field alias 别名
    async createFieldAlias(): Promise<Record<string, string>> {
      const { name, fieldsDefine, getServerConfig, fieldAliasMap = noop } = this.option.searchHelper;
      let alias: Record<string, string> = {}; // 别名映射
      // tds
      if (name && fieldsDefine && getServerConfig) {
        const DEFINE = ['valueName', 'displayName', 'descriptionName'];
        const target: Record<string, string> = {};
        try {
          const res = await getServerConfig({ name });
          if (res?.code === 200) {
            for (let key in fieldsDefine) {
              if (!DEFINE.includes(key)) continue;
              target[fieldsDefine[key]] = res.data[key];
            }
          }
        } catch (err) {}
        alias = Object.assign({}, target);
      } else {
        alias = Object.assign({}, fieldAliasMap());
      }
      return alias;
    },
  },
  render(): JSXNode {
    const { form } = this.$$form;
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      searchHelper = {},
      style = {},
      placeholder = t('qm.form.inputPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      minlength = 0,
      maxlength,
      showLimit,
      password = false,
      noInput = false,
      toUpper = false,
      unitRender,
      onInput = noop,
      onEnter = noop,
      onFocus = noop,
      onBlur = noop,
      onClick = noop,
      onDblClick = noop,
    } = options;

    const isSearchHelper: boolean = !!Object.keys(searchHelper).length;
    const isAppend: boolean = isSearchHelper || isFunction(unitRender);

    // 搜索帮助关闭，回显值事件
    const closeSearchHelper = (visible: boolean, data: Record<string, unknown>, alias: Record<string, string>): void => {
      const aliasKeys: string[] = Object.keys(alias);
      if (isObject(data) && aliasKeys.length) {
        for (let key in alias) {
          if (key !== 'extra' && !key.endsWith('__desc')) {
            form[key] = data[alias[key]];
          }
          if (key === 'extra') {
            this.$$form.desc[fieldName] = data[alias[key]];
          }
          if (key.endsWith('__desc')) {
            this.$$form.desc[key.slice(0, -6)] = data[alias[key]];
          }
        }
        if (aliasKeys.includes(fieldName)) {
          searchHelperChangeHandle(form[fieldName]);
        }
      }
      const { closed = noop } = searchHelper;
      closed(data);
      this.visible = visible;
    };

    // 搜索帮助 change 事件
    const searchHelperChangeHandle = (val: string): void => {
      const others: Record<string, ValueOf<IFormData>> = {};
      this.extraKeys.forEach((key) => (others[key] = form[key]));
      this._is_change = !1;
      onChange(val, Object.keys(others).length ? others : null);
    };

    // 执行打开动作
    const todoOpen = (val: string): void => {
      this.deriveValue = this.createFilters(val);
      this.visible = !0;
    };

    // 打开搜索帮助面板
    const openSearchHelper = (val: string, cb?: AnyFunction<void>): void => {
      // 打开的前置钩子
      const beforeOpen = searchHelper.beforeOpen ?? searchHelper.open ?? trueNoop;
      const before = beforeOpen(this.form);
      if ((before as Promise<void>)?.then) {
        (before as Promise<void>)
          .then(() => {
            todoOpen(val);
            cb?.();
          })
          .catch(() => {});
      } else if (before !== false) {
        todoOpen(val);
        cb?.();
      }
    };

    // 设置搜索帮助的值
    const resetSearchHelperValue = async (list: Record<string, unknown>[] = [], val: string): Promise<void> => {
      const alias: Record<string, string> = await this.createFieldAlias();
      const records = list.filter((data) => (data[alias[fieldName]] as any)?.toString().toLowerCase().includes(val.toLowerCase()));
      if (records.length === 1) {
        return closeSearchHelper(false, records[0], alias);
      }
      openSearchHelper(val);
    };

    // 清空搜索帮助
    const clearSearchHelperValue = (val?: boolean): void => {
      this.reset();
      form[fieldName] = undefined;
      val && searchHelperChangeHandle('');
    };

    if (isSearchHelper) {
      const fieldKeys = [...Object.keys(searchHelper.fieldAliasMap?.() ?? {}), ...Object.values(searchHelper.fieldsDefine ?? {})] as string[];
      // 其他表单项的 fieldName
      this.extraKeys = fieldKeys.filter((x) => x !== fieldName && x !== 'extra' && !x.endsWith('__desc'));
      // 表单项的表述信息
      this.descKeys = fieldKeys
        .filter((x) => x === 'extra' || x.endsWith('__desc'))
        .map((x) => {
          if (x === 'extra') {
            return fieldName;
          }
          return x.slice(0, -6);
        });
    }

    const dialogProps = isSearchHelper
      ? {
          visible: this.visible,
          title: t('qm.searchHelper.text'),
          width: searchHelper.width ?? '60%',
          height: searchHelper.height,
          loading: false,
          destroyOnClose: true,
          containerStyle: { paddingBottom: '52px' },
          'onUpdate:visible': (val: boolean): void => {
            this.visible = val;
          },
          onClose: (): void => {
            this.deriveValue = {};
            if (this._is_change) {
              clearSearchHelperValue();
            }
            this._is_change = !1;
          },
        }
      : null;

    const searchHelperProps = isSearchHelper
      ? {
          ...searchHelper,
          initialValue: merge({}, searchHelper.initialValue, this.deriveValue),
          onClose: closeSearchHelper,
        }
      : null;

    const wrapProps = {
      modelValue: form[fieldName],
      'onUpdate:modelValue': (val: string): void => {
        // 搜索帮助，不允许输入
        if (noInput) return;
        form[fieldName] = !toUpper ? val : val.toUpperCase();
        onInput(val);
        isSearchHelper && (this._is_change = !0);
      },
    };

    const cls = {
      [`el-search-helper`]: isSearchHelper,
    };

    this.$$form.setViewValue(fieldName, form[fieldName]);

    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth && getParserWidth(labelWidth)}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <el-input
          ref={type}
          class={cls}
          {...wrapProps}
          title={form[fieldName]}
          minlength={minlength}
          maxlength={maxlength}
          placeholder={!disabled ? (!isSearchHelper ? placeholder : t('qm.form.selectPlaceholder')) : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          show-password={password}
          show-word-limit={showLimit}
          onChange={(val: string): void => {
            val = val.trim();
            form[fieldName] = val;
            if (isSearchHelper) {
              if (!val) {
                clearSearchHelperValue(!0);
              }
              if (val && searchHelper.table.fetch?.api) {
                if (searchHelper.closeServerMatch) {
                  searchHelperChangeHandle(form[fieldName]);
                } else {
                  this.getSearchHelperTableData(val)
                    .then((list) => resetSearchHelperValue(list, val))
                    .catch(() => clearSearchHelperValue(!0));
                }
              }
            } else {
              onChange(form[fieldName], null);
            }
          }}
          onFocus={onFocus}
          onBlur={() => {
            onBlur(form[fieldName]);
          }}
          onClick={() => {
            onClick(form[fieldName]);
          }}
          onDblclick={() => {
            onDblClick(form[fieldName]);
            if (!isSearchHelper || disabled) return;
            openSearchHelper(form[fieldName], () => {
              // 防止二次触发 change 事件
              this.$refs[type].blur();
            });
          }}
          onKeyup={(ev) => {
            if (ev.keyCode !== 13) return;
            if (isSearchHelper) return;
            onEnter(ev.target.value.trim());
            this.$$form.formItemValidate(fieldName);
          }}
          v-slots={{
            append: isAppend
              ? (): JSXNode => {
                  if (isSearchHelper) {
                    return (
                      <qm-button
                        icon="el-icon-search"
                        style={disabled && { cursor: 'not-allowed' }}
                        click={(): void => {
                          if (disabled) return;
                          openSearchHelper(form[fieldName]);
                        }}
                      />
                    );
                  }
                  return <div style={disabled && { pointerEvents: 'none' }}>{unitRender()}</div>;
                }
              : null,
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
        {isSearchHelper && (
          <Dialog {...dialogProps}>
            <SearchHelper {...searchHelperProps} />
          </Dialog>
        )}
      </el-form-item>
    );
  },
});
