/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 13:02:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-25 19:48:52
 */
import { CSSProperties, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, AnyFunction } from '../../_utils/types';

import { isNumber } from 'lodash-es';
import { isValidWidthUnit } from '../../_utils/validators';

export type IFormType = 'default' | 'search' | 'onlyShow';

export type IFormItemType =
  | 'BREAK_SPACE'
  | 'INPUT'
  | 'RANGE_INPUT'
  | 'INPUT_NUMBER'
  | 'RANGE_INPUT_NUMBER'
  | 'TREE_SELECT'
  | 'MULTIPLE_TREE_SELECT'
  | 'CASCADER'
  | 'MULTIPLE_CASCADER'
  | 'SELECT'
  | 'CHECKBOX'
  | 'TINYMCE';

export const ARRAY_TYPE: IFormItemType[] = [
  'RANGE_INPUT',
  'RANGE_INPUT_NUMBER',
  'MULTIPLE_TREE_SELECT',
  'MULTIPLE_CASCADER',
];
export const FORMAT_TYPE: IFormItemType[] = ['RANGE_INPUT', 'RANGE_INPUT_NUMBER'];
export const UNFIX_TYPE: IFormItemType[] = ['TINYMCE'];

export type IFormData = Record<string, string | number | Array<string | number> | undefined>;

export type IFormItem = {
  type: IFormItemType;
  fieldName: string;
  label: string;
  labelWidth?: number | string;
  hidden?: boolean;
  invisible?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>[];
  selfCols?: number;
  offsetLeft?: number;
  offsetRight?: number;
  style?: CSSProperties;
  options?: {
    itemList?: Record<string, string | number>[];
    trueValue?: number | string;
    falseValue?: number | string;
    secretType?: string;
  };
  labelOptions: IFormItem;
  readonly?: boolean;
  noResetable?: boolean;
  render?: AnyFunction<JSXNode>;
  __cols__?: number; // 私有属性
};

export type IFormDesc = Record<string, string>;

export const props = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      fieldName: PropTypes.string,
      label: PropTypes.string,
      labelWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      hidden: PropTypes.bool,
      invisible: PropTypes.bool,
      disabled: PropTypes.bool,
      rules: PropTypes.array,
      readonly: PropTypes.bool,
      noResetable: PropTypes.bool,
      selfCols: PropTypes.number.def(1),
      offsetLeft: PropTypes.number.def(0),
      offsetRight: PropTypes.number.def(0),
      style: PropTypes.object,
      options: PropTypes.shape({
        itemList: PropTypes.array,
        trueValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        falseValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        secretType: PropTypes.string,
      }),
      labelOptions: PropTypes.object,
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
};
