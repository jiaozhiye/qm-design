/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 23:31:38
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { AnyFunction, JSXNode, Nullable } from '../../_utils/types';

import { isNumber, isObject, isFunction } from 'lodash-es';
import { useGlobalConfig, getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidWidthUnit } from '../../_utils/validators';
import { t } from '../../locale';
import { warn } from '../../_utils/error';
import { FormColsMixin } from './form-cols-mixin';

import FormInput from './form-input';

type IFormType = 'default' | 'search' | 'onlyShow';

type IForm = Record<string, string | number | Array<string | number> | undefined>;

type IFormItem = {
  type: string;
  fieldName: string;
  label: string;
  hidden?: boolean;
  invisible?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>[];
  selfCols?: number;
  offsetLeft?: number;
  offsetRight?: number;
  render?: AnyFunction<JSXNode>;
  __cols__?: number; // 私有属性
};

const ARRAY_TYPE: string[] = ['RANGE_DATE'];

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
  emits: ['collapseChange'],
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
      type: Object as PropType<IForm>,
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
      form: {},
      expand: false, // 展开收起状态
    };
  },
  computed: {
    formItemList() {
      const result: Array<IFormItem> = [];
      this.list
        .filter((x) => x.fieldName)
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
    showCollapse(): boolean {
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
    expand(next: boolean): void {
      if (!this.showCollapse) return;
      this.$emit('collapseChange', next);
    },
  },
  methods: {
    // input + search helper
    INPUT(): JSXNode {
      return <FormInput />;
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
      const { flexCols: cols, defaultRows, formType, expand, showCollapse } = this;

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
                display: !showCollapse || isBlock ? 'block' : 'none',
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
      const { flexCols: cols, expand, showCollapse, formType, isSubmitBtn } = this;

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
          {showCollapse ? (
            <el-button type="text" onClick={() => (this.expand = !expand)}>
              {expand ? t('qm.form.collect') : t('qm.form.spread')}{' '}
              <i class={expand ? 'el-icon-arrow-up' : 'el-icon-arrow-down'} />
            </el-button>
          ) : null}
        </el-col>
      ) : null;
    },
  },
  render(): JSXNode {
    const { form, rules, labelWidth } = this;

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
    };

    return (
      <div class={cls}>
        <el-form ref="form" {...wrapProps}>
          <el-row gutter={4}>{this.createFormLayout()}</el-row>
        </el-form>
      </div>
    );
  },
});
