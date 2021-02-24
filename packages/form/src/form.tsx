/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-24 12:29:52
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { AnyFunction, JSXNode, Nullable, ValueOf } from '../../_utils/types';

import { isNumber, isObject, isFunction, isUndefined, cloneDeep, xor } from 'lodash-es';
import { useGlobalConfig, getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidWidthUnit } from '../../_utils/validators';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { noop, difference, secretFormat } from './utils';
import { FormColsMixin } from './form-cols-mixin';

import FormInput from './form-input';
import FromCheckbox from './form-checkbox';

type IFormType = 'default' | 'search' | 'onlyShow';

type IFormItemType = 'INPUT' | 'CHECKBOX' | 'RANGE_DATE';

type IFormData = Record<string, string | number | Array<string | number> | undefined>;

type IFormItem = {
  type: IFormItemType;
  fieldName: string;
  label: string;
  hidden?: boolean;
  invisible?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>[];
  selfCols?: number;
  offsetLeft?: number;
  offsetRight?: number;
  options?: {
    falseValue?: number | string;
    secretType?: string;
  };
  readonly?: boolean;
  render?: AnyFunction<JSXNode>;
  __cols__?: number; // 私有属性
};

type IFormDesc = Record<string, string>;

const ARRAY_TYPE: IFormItemType[] = ['RANGE_DATE'];

export default defineComponent({
  name: 'QmForm',
  componentName: 'QmForm',
  inheritAttrs: false,
  mixins: [FormColsMixin],
  provide() {
    return {
      $$form: this,
    };
  },
  emits: ['collapseChange', 'valuesChange'],
  props: {
    list: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        fieldName: PropTypes.string,
        label: PropTypes.string,
        hidden: PropTypes.bool,
        invisible: PropTypes.bool,
        disabled: PropTypes.bool,
        rules: PropTypes.array,
        selfCols: PropTypes.number.def(1),
        offsetLeft: PropTypes.number.def(0),
        offsetRight: PropTypes.number.def(0),
        render: PropTypes.func,
      }).loose
    ).def([]),
    labelWidth: {
      type: [Number, String] as PropType<number | string>,
      default: '80px',
      validator: (val: number | string): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    initialValue: {
      type: Object as PropType<IFormData>,
      default: () => ({}),
    },
    cols: {
      type: Number,
    },
    defaultRows: {
      type: Number,
      default: 1,
    },
    formType: {
      type: String as PropType<IFormType>,
      default: 'default',
    },
    isCollapse: {
      type: Boolean,
      default: true,
    },
    isSubmitBtn: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      form: {}, // 表单
      desc: {}, // 描述信息
      expand: false, // 展开收起状态
    };
  },
  computed: {
    formItemList() {
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
    dividers(): Array<IFormItem> {
      return this.list.filter((x) => x.type === 'BREAK_SPACE');
    },
    isFormCollapse(): boolean {
      return this.dividers.some((x) => !!x.collapse);
    },
    isFilterCollapse(): boolean {
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
    expand(next: boolean): void {
      if (!this.isFilterCollapse) return;
      this.$emit('collapseChange', next);
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
      const { type = '', options = {}, readonly } = item;
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
      if (!this.isFormCollapse) return;
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
              placeholder=""
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
    // ============================================
    // input + search helper
    INPUT(option: IFormItem): JSXNode {
      return <FormInput option={option} />;
    },
    CHECKBOX(option: IFormItem): JSXNode {
      return <FromCheckbox option={option} />;
    },
    // ============================================
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
      const { flexCols: cols, defaultRows, formType, expand, isFilterCollapse } = this;

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
        const { fieldName, selfCols = 1, __cols__ } = x;
        // 判断改栅格是否显示
        const isBlock: boolean = expand ? true : __cols__ < defaultPlayRows * cols;
        if (isBlock) {
          tmpArr.push(__cols__);
        }
        return (
          <el-col
            key={i}
            span={selfCols * colSpan}
            style={
              formType === 'search' && {
                display: !isFilterCollapse || isBlock ? 'block' : 'none',
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
      const { flexCols: cols, expand, isFilterCollapse, formType, isSubmitBtn } = this;

      // 不是搜索类型
      if (formType !== 'search') {
        return null;
      }

      const colSpan = 24 / cols;
      // 左侧偏移量
      const offset = cols - (lastCols % cols) - 1;

      return isSubmitBtn ? (
        <el-col key="-" span={colSpan} offset={offset * colSpan} style={{ textAlign: 'right' }}>
          <el-button type="primary" icon="iconfont icon-search">
            {t('qm.form.search')}
          </el-button>
          <el-button icon="iconfont icon-reload">{t('qm.form.reset')}</el-button>
          {isFilterCollapse ? (
            <el-button type="text" onClick={() => (this.expand = !expand)}>
              {expand ? t('qm.form.collect') : t('qm.form.spread')}{' '}
              <i class={expand ? 'el-icon-arrow-up' : 'el-icon-arrow-down'} />
            </el-button>
          ) : null}
        </el-col>
      ) : null;
    },
    // 表单类型按钮列表
    createFormButtonLayout(): Nullable<JSXNode> {
      const { flexCols: cols, formType, isSubmitBtn } = this;
      if (formType === 'search') return null;
      const colSpan = 24 / cols;
      return isSubmitBtn && formType === 'default' ? (
        <el-row gutter={4}>
          <el-col key="-" span={colSpan}>
            <el-form-item label={''}>
              <el-button type="primary">{t('qm.form.save')}</el-button>
              <el-button>{t('qm.form.reset')}</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      ) : null;
    },
  },
  render(): JSXNode {
    const { form, rules, labelWidth, formType } = this;

    const $DESIGN = useGlobalConfig();
    const prefixCls = getPrefixCls('form');

    const wrapProps = {
      model: form,
      rules,
      labelWidth: getParserWidth(labelWidth),
      onSubmit: (ev: Event): void => ev.preventDefault(),
    };

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $DESIGN.size === 'medium',
      [`${prefixCls}--small`]: $DESIGN.size === 'small',
      [`${prefixCls}--mini`]: $DESIGN.size === 'mini',
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
