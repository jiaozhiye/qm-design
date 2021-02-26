/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 12:41:19
 */
import { ComponentPublicInstance, defineComponent } from 'vue';
import scrollIntoView from 'scroll-into-view-if-needed';
import { isObject, isFunction, cloneDeep, xor } from 'lodash-es';
import { AnyObject, JSXNode, Nullable, ValueOf } from '../../_utils/types';
import { getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { useSize } from '../../hooks/useSize';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { noop, difference, secretFormat } from './utils';
import { FormColsMixin } from './form-cols-mixin';
import { PublicMethodsMixin } from './public-methods-mixin';
import {
  IFormType,
  IFormData,
  IFormItem,
  IFormDesc,
  props,
  ARRAY_TYPE,
  FORMAT_TYPE,
  UNFIX_TYPE,
} from './types';

import FormInput from './form-input';
import FormRangeInput from './form-range-input';
import FromInputNumber from './form-input-number';
import FromRangeInputNumber from './form-range-input-number';
import FormTreeSelect from './form-tree-select';
import FormCascader from './form-cascader';
import FormSelect from './form-select';
import FormRadio from './form-radio';
import FromCheckbox from './form-checkbox';
import FormCheckboxGroup from './form-checkbox-group';
import FormTextArea from './form-text-area';
import FormDivider from './form-divider';

const EMITS = ['collapse', 'valuesChange', 'change', 'finish', 'finishFailed', 'reset'];

export default defineComponent({
  name: 'QmForm',
  componentName: 'QmForm',
  inheritAttrs: false,
  mixins: [FormColsMixin, PublicMethodsMixin],
  provide() {
    return {
      $$form: this,
    };
  },
  emits: EMITS,
  props,
  data() {
    return {
      form: {}, // 表单
      desc: {}, // 描述信息
      view: {}, // 视图数据
      collapse: false, // 展开收起状态
    };
  },
  computed: {
    formItemList(): IFormItem[] {
      const result: Array<IFormItem> = [];
      this.list
        .filter((x) => x.type !== 'BREAK_SPACE' && x.fieldName)
        .forEach((x) => {
          if (isObject(x.labelOptions) && x.labelOptions.fieldName) {
            result.push(x.labelOptions);
          }
          result.push(x);
        });
      return result;
    },
    fieldNames(): string[] {
      return this.formItemList.map((x) => x.fieldName);
    },
    rules() {
      const result: Record<string, IFormItem['rules']> = {};
      this.formItemList.forEach((x) => {
        if (!x.rules) return;
        result[x.fieldName] = x.rules;
      });
      return result;
    },
    descContents(): Array<IFormDesc> {
      return this.formItemList
        .filter((x) => isObject(x.descOptions))
        .map((x) => ({ fieldName: x.fieldName, content: x.descOptions.content }));
    },
    isFilterType(): boolean {
      return this.formType === 'search';
    },
    dividers(): Array<IFormItem> {
      return this.list.filter((x) => x.type === 'BREAK_SPACE');
    },
    isDividerCollapse(): boolean {
      return this.dividers.some((x) => !!x.collapse);
    },
    showFilterCollapse(): boolean {
      const total: number = this.list.filter((x) => !x.hidden).length;
      return this.isCollapse && total >= this.flexCols;
    },
  },
  watch: {
    fieldNames: {
      handler(next: string[], prev: string[]): void {
        if ([...new Set(next)].length !== next.length) {
          warn('qm-form', `配置项 fieldName 属性是唯一的，不能重复`);
        }
        if (!Array.isArray(prev)) return;
        const diffs: string[] = xor(prev, next);
        if (!diffs.length) return;
        diffs.forEach((x) => {
          if (prev.includes(x)) {
            delete this.form[x];
          } else {
            let item: IFormItem = this.formItemList.find((k) => k.fieldName === x);
            if (this.formType === 'onlyShow') {
              item.disabled = true;
            }
            this.form[x] = this.getInitialValue(item, this.form[x] ?? this.initialValue[x]);
          }
        });
      },
      immediate: true,
    },
    formType: {
      handler(next: IFormType): void {
        if (next !== 'onlyShow') return;
        this.formItemList.forEach((x) => {
          x.disabled = true;
        });
      },
      immediate: true,
    },
    form: {
      handler(val: IFormData): void {
        const diff: IFormData = difference(val, this.initialValues) as IFormData;
        if (!Object.keys(diff).length) return;
        this.$emit('valuesChange', diff);
      },
      deep: true,
    },
    desc: {
      handler(val: IFormDesc): void {
        this.formItemList.forEach((x) => {
          if (isObject(x.descOptions)) {
            x.descOptions.content = val[x.fieldName];
          }
        });
      },
      deep: true,
    },
    rules(): void {
      this.$nextTick(() => this.$refs[`form`].clearValidate());
    },
    descContents(val: Array<IFormDesc>): void {
      val.forEach((x) => (this.desc[x.fieldName] = x.content));
    },
    collapse(next: boolean): void {
      if (!this.showFilterCollapse) return;
      this.$emit('collapse', next);
    },
  },
  created() {
    this.initialHandle();
  },
  methods: {
    // 组件初始化方法
    initialHandle(): void {
      const _form = this.createFormValue();
      const _desc = this.createDescription();
      this.initialValues = cloneDeep(_form); // 用于重置表单值 - 深拷贝
      this.initialExtras = Object.assign({}, _desc); // 用于重置描述 - 浅拷贝
      this.form = _form;
      this.desc = _desc;
    },
    // 创建表单数据
    createFormValue(): IFormData {
      const target: IFormData = {};
      this.formItemList.forEach((x) => {
        target[x.fieldName] = this.getInitialValue(x, this.initialValue[x.fieldName]);
      });
      return Object.assign({}, this.initialValue, target);
    },
    // 创建描述数据
    createDescription(): IFormDesc {
      const target: IFormDesc = {};
      this.formItemList
        .filter((x) => isObject(x.descOptions))
        .forEach((x) => {
          target[x.fieldName] = x.descOptions.content;
        });
      return Object.assign({}, target);
    },
    // 获取表单数据的初始值
    getInitialValue(item: IFormItem, val: any): ValueOf<IFormData> {
      const { type, options = {}, readonly } = item;
      val = val ?? undefined;
      if (ARRAY_TYPE.includes(type)) {
        val = val ?? [];
      }
      if (type === 'INPUT' && (readonly || item.disabled)) {
        const { secretType } = options;
        if (secretType) {
          val = secretFormat(val, secretType);
        }
      }
      if (type === 'CHECKBOX') {
        val = val ?? options.falseValue ?? '0';
      }
      return val;
    },
    setViewValue(fieldName: string, val: unknown): void {
      if (!this.isDividerCollapse) return;
      if (val !== this.view[fieldName]) {
        this.view = Object.assign({}, this.view, { [fieldName]: val });
      }
    },
    createFormItemLabel(option): JSXNode {
      const { form } = this;
      const {
        label,
        type = 'SELECT',
        fieldName,
        options = {},
        style = {},
        disabled,
        onChange = noop,
      } = option;
      const { itemList, trueValue = '1', falseValue = '0' } = options;
      return (
        <div class="label-wrap" style={{ ...style }}>
          {type === 'SELECT' && (
            <el-select
              v-model={form[fieldName]}
              placeholder={''}
              disabled={disabled}
              onChange={onChange}
            >
              {itemList.map((x) => (
                <el-option key={x.value} label={x.text} value={x.value} disabled={x.disabled} />
              ))}
            </el-select>
          )}
          {type === 'CHECKBOX' && (
            <span>
              <span class="desc-text" style={{ paddingRight: '10px' }}>
                {label}
              </span>
              <el-checkbox
                v-model={form[fieldName]}
                trueLabel={trueValue}
                falseLabel={falseValue}
                disabled={disabled}
                onChange={onChange}
              />
            </span>
          )}
        </div>
      );
    },
    createFormItemDesc(option): JSXNode {
      const { fieldName, isTooltip, style = {} } = option;
      const content: JSXNode | string = this.desc[fieldName] ?? '';
      if (isTooltip) {
        return (
          <el-tooltip
            effect="dark"
            placement="right"
            v-slots={{
              content: (): JSXNode => <div>{content}</div>,
            }}
          >
            <i class="desc-icon el-icon-info" />
          </el-tooltip>
        );
      }
      return (
        <span
          title={content as string}
          class="desc-text text_overflow_cut"
          style={{ display: 'inline-block', paddingLeft: '10px', ...style }}
        >
          {content}
        </span>
      );
    },
    renderFormItem(option: IFormItem): JSXNode {
      const { label, fieldName, labelWidth, labelOptions, style = {}, render = noop } = option;
      return (
        <el-form-item
          key={fieldName}
          label={label}
          labelWidth={labelWidth && getParserWidth(labelWidth)}
          prop={fieldName}
          v-slots={{
            label: (): JSXNode => labelOptions && this.createFormItemLabel(labelOptions),
          }}
        >
          <div class="desc-text" style={{ width: '100%', ...style }}>
            {render(option, this)}
          </div>
        </el-form-item>
      );
    },
    // ============================================
    BREAK_SPACE(option: IFormItem): JSXNode {
      return <FormDivider ref={option.fieldName} option={option} />;
    },
    // input + search helper
    INPUT(option: IFormItem): JSXNode {
      return <FormInput ref={option.fieldName} option={option} />;
    },
    RANGE_INPUT(option: IFormItem): JSXNode {
      return <FormRangeInput ref={option.fieldName} option={option} />;
    },
    INPUT_NUMBER(option: IFormItem): JSXNode {
      return <FromInputNumber ref={option.fieldName} option={option} />;
    },
    RANGE_INPUT_NUMBER(option: IFormItem): JSXNode {
      return <FromRangeInputNumber ref={option.fieldName} option={option} />;
    },
    TREE_SELECT(option: IFormItem): JSXNode {
      return <FormTreeSelect ref={option.fieldName} option={option} />;
    },
    MULTIPLE_TREE_SELECT(option: IFormItem): JSXNode {
      return <FormTreeSelect ref={option.fieldName} option={option} multiple />;
    },
    CASCADER(option: IFormItem): JSXNode {
      return <FormCascader ref={option.fieldName} option={option} />;
    },
    MULTIPLE_CASCADER(option: IFormItem): JSXNode {
      return <FormCascader ref={option.fieldName} option={option} multiple />;
    },
    SELECT(option: IFormItem): JSXNode {
      return <FormSelect ref={option.fieldName} option={option} />;
    },
    MULTIPLE_SELECT(option: IFormItem): JSXNode {
      return <FormSelect ref={option.fieldName} option={option} multiple />;
    },
    RADIO(option: IFormItem): JSXNode {
      return <FormRadio ref={option.fieldName} option={option} />;
    },
    CHECKBOX(option: IFormItem): JSXNode {
      return <FromCheckbox ref={option.fieldName} option={option} />;
    },
    MULTIPLE_CHECKBOX(option: IFormItem): JSXNode {
      return <FormCheckboxGroup ref={option.fieldName} option={option} />;
    },
    TEXT_AREA(option: IFormItem): JSXNode {
      return <FormTextArea ref={option.fieldName} option={option} />;
    },
    // ============================================
    // 锚点定位没有通过校验的表单项
    scrollToField(fields: AnyObject<unknown>): void {
      const ids: string[] = Object.keys(fields);
      if (!ids.length) return;
      scrollIntoView(document.getElementById(ids[0]), {
        scrollMode: 'if-needed',
        block: 'nearest',
      });
    },
    // 处理 from data 数据
    excuteFormValue(form: IFormData): void {
      this.formItemList
        .filter((x) => FORMAT_TYPE.includes(x.type))
        .map((x) => x.fieldName)
        .forEach((fieldName) => {
          if ((form[fieldName] as Array<unknown>).length > 0) {
            let isEmpty = (form[fieldName] as Array<unknown>).every((x) => {
              let val = x ?? '';
              return val === '';
            });
            if (isEmpty) {
              form[fieldName] = [];
            } else {
              form[fieldName] = Object.assign([], [undefined, undefined], form[fieldName]);
            }
          }
        });
      for (let attr in form) {
        if (form[attr] === '' || form[attr] === null) {
          form[attr] = undefined;
        }
        if (attr.includes('|') && Array.isArray(form[attr])) {
          let [start, end] = attr.split('|');
          form[start] = form[attr][0];
          form[end] = form[attr][1];
        }
      }
    },
    // 对返回数据进行格式化
    formatFormValue(form: IFormData): IFormData {
      const formData = {};
      for (let key in form) {
        if (typeof form[key] !== 'undefined') continue;
        !this.isFilterType && (formData[key] = '');
      }
      return cloneDeep(Object.assign({}, form, formData));
    },
    // 表单校验
    formValidate(): Promise<IFormData> {
      this.excuteFormValue(this.form);
      return new Promise((resolve, reject) => {
        this.$refs[`form`].validate((valid, fields) => {
          if (!valid) {
            reject(fields);
            !this.isFilterType && this.scrollToField(fields);
          } else {
            resolve(this.form);
          }
        });
      });
    },
    // 表单字段校验
    formItemValidate(fieldName: string): void {
      this.$refs[`form`].validateField(fieldName);
    },
    // 表单提交
    async submitForm(ev: Event): Promise<void> {
      ev?.preventDefault();
      try {
        const res = await this.formValidate();
        const data = this.formatFormValue(res);
        this.$emit('finish', data);
        this.$emit('change', data);
      } catch (err) {
        this.$emit('finishFailed', err);
      }
    },
    // 表单重置
    resetForm(): void {
      this.formItemList.forEach((x: IFormItem) => {
        if (!x.noResetable) {
          this.SET_FIELDS_VALUE({ [x.fieldName]: cloneDeep(this.initialValues[x.fieldName]) });
        }
        // 搜索帮助
        let extraKeys: string[] = this[`${x.fieldName}ExtraKeys`];
        if (Array.isArray(extraKeys) && extraKeys.length) {
          extraKeys.forEach((key) => {
            this.SET_FORM_VALUES({ [key]: undefined });
          });
        }
        let descKeys: string[] = this[`${x.fieldName}DescKeys`];
        if (Array.isArray(descKeys) && descKeys.length) {
          descKeys.forEach((key) => {
            this.desc[key] = undefined;
          });
        }
      });
      // this.$refs[`form`].resetFields();
      this.desc = Object.assign({}, this.initialExtras);
      // 解决日期区间(拆分后)重复校验的 bug
      this.$nextTick(() => {
        this.$refs[`form`].clearValidate();
        // 筛选器
        if (this.isFilterType) {
          this.$emit('reset');
          // 重置后，执行表单提交 - 次功能待确认
          this.submitForm();
        }
      });
    },
    // 清空表单
    clearForm(): void {
      for (let key in this.form) {
        this.form[key] = Array.isArray(this.form[key]) ? [] : undefined;
      }
    },
    // 表单元素
    createFormItem(item: IFormItem): Nullable<JSXNode> {
      if (!isFunction(this[item.type])) {
        warn('qm-form', `配置项 ${item.fieldName} 的 type 类型错误`);
        return null;
      }
      return !item.invisible
        ? item.render
          ? this.renderFormItem(item)
          : this[item.type](item)
        : null;
    },
    // 表单布局
    createFormLayout(): Array<JSXNode> {
      const { flexCols: cols, defaultRows, isFilterType, collapse, showFilterCollapse } = this;

      // 栅格列的数组
      const colsArr: Partial<IFormItem>[] = [];
      this.list
        .filter((x) => !x.hidden)
        .forEach((x) => {
          const { offsetLeft = 0, offsetRight = 0 } = x;
          for (let i = 0; i < offsetLeft; i++) {
            colsArr.push({});
          }
          colsArr.push(x);
          for (let i = 0; i < offsetRight; i++) {
            colsArr.push({});
          }
        });

      const colSpan = 24 / cols;
      // 栅格所占的总列数
      const total = colsArr.reduce((prev, cur) => {
        const { selfCols = 1 } = cur;
        const sum: number = prev + selfCols;
        cur.__cols__ = sum; // 当前栅格及之前所跨的列数
        return sum;
      }, 0);

      // 默认展示的行数
      const defaultPlayRows: number =
        defaultRows > Math.ceil(total / cols) ? Math.ceil(total / cols) : defaultRows;

      const tmpArr: number[] = []; // 用于获取最后一个展示栅格的 __cols__
      const colFormItems = colsArr.map((x, i) => {
        let { fieldName, selfCols = 1, __cols__, type } = x;
        // 调整 selfCols 的大小
        selfCols = selfCols >= 24 || type === 'BREAK_SPACE' || type === 'TINYMCE' ? cols : selfCols;
        // 判断改栅格是否显示
        const isBlock: boolean = collapse ? true : __cols__ < defaultPlayRows * cols;
        if (isBlock) {
          tmpArr.push(__cols__);
        }
        return (
          <el-col
            key={i}
            type={UNFIX_TYPE.includes(type) ? 'UN_FIXED' : 'FIXED'}
            id={fieldName}
            span={selfCols * colSpan}
            style={
              isFilterType && {
                display: !showFilterCollapse || isBlock ? 'block' : 'none',
              }
            }
          >
            {fieldName ? this.createFormItem(x) : null}
          </el-col>
        );
      });

      return [...colFormItems, this.createSearchButtonLayout(tmpArr[tmpArr.length - 1])];
    },
    // 搜索类型按钮布局
    createSearchButtonLayout(lastCols = 0): Nullable<JSXNode> {
      const { flexCols: cols, collapse, showFilterCollapse, isFilterType, isSubmitBtn } = this;

      // 不是搜索类型
      if (!isFilterType) {
        return null;
      }

      const colSpan = 24 / cols;
      // 左侧偏移量
      const offset = cols - (lastCols % cols) - 1;

      return isSubmitBtn ? (
        <el-col key="-" span={colSpan} offset={offset * colSpan} style={{ textAlign: 'right' }}>
          <el-button type="primary" icon="iconfont icon-search" onClick={this.submitForm}>
            {t('qm.form.search')}
          </el-button>
          <el-button icon="iconfont icon-reload" onClick={this.resetForm}>
            {t('qm.form.reset')}
          </el-button>
          {showFilterCollapse ? (
            <el-button type="text" onClick={() => (this.collapse = !collapse)}>
              {collapse ? t('qm.form.collect') : t('qm.form.spread')}{' '}
              <i class={collapse ? 'el-icon-arrow-up' : 'el-icon-arrow-down'} />
            </el-button>
          ) : null}
        </el-col>
      ) : null;
    },
    // 表单类型按钮列表
    createFormButtonLayout(): Nullable<JSXNode> {
      const { flexCols: cols, formType, isFilterType, isSubmitBtn } = this;
      if (isFilterType) return null;
      const colSpan = 24 / cols;
      return isSubmitBtn && formType === 'default' ? (
        <el-row gutter={4}>
          <el-col key="-" span={colSpan}>
            <el-form-item label={''}>
              <el-button type="primary" onClick={this.submitForm}>
                {t('qm.form.save')}
              </el-button>
              <el-button onClick={this.resetForm}>{t('qm.form.reset')}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      ) : null;
    },
    // 获取子组件实例
    $$(paths: string): ComponentPublicInstance {
      let ret = this;
      paths.split('-').map((path) => {
        ret = ret.$refs?.[path];
      });
      return ret;
    },
  },
  render(): JSXNode {
    const { form, rules, labelWidth, formType } = this;
    const prefixCls = getPrefixCls('form');
    const wrapProps = {
      model: form,
      rules,
      labelWidth: getParserWidth(labelWidth),
      onSubmit: (ev: Event): void => ev.preventDefault(),
    };
    const { $size } = useSize(this.$props);
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
      [`${prefixCls}__only-show`]: formType === 'onlyShow',
    };
    return (
      <div class={cls}>
        <el-form ref="form" {...wrapProps}>
          <el-row gutter={4}>{this.createFormLayout()}</el-row>
          {this.createFormButtonLayout()}
        </el-form>
      </div>
    );
  },
});
