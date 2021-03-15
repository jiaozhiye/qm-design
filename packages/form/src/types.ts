/*
 * @Author: 焦质晔
 * @Date: 2021-02-24 13:02:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 18:10:20
 */
import { CSSProperties, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, AnyFunction, Nullable, ComponentSize, AnyObject, ValueOf } from '../../_utils/types';

import { isNumber } from 'lodash-es';
import { isValidWidthUnit, isValidComponentSize } from '../../_utils/validators';
import { noop } from './utils';
import { t } from '../../locale';

export type IFormType = 'default' | 'search' | 'onlyShow';

export type ISecretType = 'finance' | 'name' | 'phone' | 'IDnumber' | 'bankNumber';

export type IDateType =
  | 'date'
  | 'datetime'
  | 'exactdate'
  | 'daterange'
  | 'datetimerange'
  | 'exactdaterange'
  | 'week'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange';

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
  | 'MULTIPLE_SELECT'
  | 'REGION_SELECT'
  | 'SWITCH'
  | 'RADIO'
  | 'CHECKBOX'
  | 'MULTIPLE_CHECKBOX'
  | 'TEXT_AREA'
  | 'SEARCH_HELPER'
  | 'DATE'
  | 'RANGE_DATE'
  | 'RANGE_DATE_EL'
  | 'TIME'
  | 'RANGE_TIME'
  | 'TIME_SELECT'
  | 'RANGE_TIME_SELECT'
  | 'UPLOAD_IMG'
  | 'UPLOAD_FILE'
  | 'TINYMCE';

export const ARRAY_TYPE: IFormItemType[] = [
  'RANGE_INPUT',
  'RANGE_INPUT_NUMBER',
  'MULTIPLE_TREE_SELECT',
  'MULTIPLE_CASCADER',
  'MULTIPLE_SELECT',
  'REGION_SELECT',
  'MULTIPLE_CHECKBOX',
  'RANGE_DATE',
  'RANGE_DATE_EL',
  'RANGE_TIME',
  'RANGE_TIME_SELECT',
  'UPLOAD_IMG',
  'UPLOAD_FILE',
];
export const FORMAT_TYPE: IFormItemType[] = ['RANGE_INPUT', 'RANGE_INPUT_NUMBER', 'RANGE_DATE', 'RANGE_DATE_EL', 'RANGE_TIME', 'RANGE_TIME_SELECT'];
export const UNFIX_TYPE: IFormItemType[] = ['TEXT_AREA', 'MULTIPLE_CHECKBOX', 'UPLOAD_IMG', 'UPLOAD_FILE', 'TINYMCE'];

export type IFormData = Record<string, string | number | Array<string | number> | undefined>;

export type IFormItem = {
  type: IFormItemType;
  fieldName: string;
  label: string;
  labelWidth?: number | string;
  description?: string;
  hidden?: boolean;
  invisible?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>[];
  selfCols?: number;
  offsetLeft?: number;
  offsetRight?: number;
  style?: CSSProperties;
  id?: string;
  options?: {
    itemList?: Record<string, string | number>[];
    secretType?: ISecretType;
    trueValue?: number | string;
    falseValue?: number | string;
    dateType?: IDateType;
    minDateTime?: string;
    maxDateTime?: string;
    defaultTime?: string;
    shortCuts?: boolean;
    unlinkPanels?: boolean;
    startDisabled?: boolean;
    endDisabled?: boolean;
    columns?: Record<string, string>[];
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    onlySelect?: boolean;
    limit?: number;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    controls?: boolean;
    minlength?: number;
    maxlength?: number;
    rows?: number;
    maxrows?: number;
    showLimit?: boolean;
    password?: boolean;
    noInput?: boolean;
    toUpper?: boolean;
    filterable?: boolean;
    collapseTags?: boolean;
    openPyt?: boolean;
    onInput?: AnyFunction<any>;
    onClick?: AnyFunction<any>;
    onDblClick?: AnyFunction<any>;
    onEnter?: AnyFunction<any>;
    onFocus?: AnyFunction<any>;
    onBlur?: AnyFunction<any>;
  };
  searchHelper?: {
    name?: string;
    filters?: Array<IFormItem>;
    initialValue?: AnyObject<ValueOf<IFormData>>;
    showFilterCollapse?: boolean;
    table?: {
      fetch?: AnyObject<unknown>;
      columns?: Array<unknown>;
      rowKey?: string | AnyFunction<string | number>;
      webPagination?: boolean;
    };
    filterAliasMap?: AnyFunction<string[]>;
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    getServerConfig?: AnyFunction<Promise<unknown>>;
    fieldsDefine?: Record<string, string>;
    beforeOpen?: AnyFunction<void | Promise<void> | boolean>;
    open?: AnyFunction<void | Promise<void> | boolean>;
    closed?: AnyFunction<void>;
  };
  request?: {
    fetchApi: AnyFunction<any>;
    params?: Record<string, any>;
    datakey?: string;
    valueKey?: string;
    textKey?: string;
  };
  upload?: {
    actionUrl: string;
    headers?: AnyObject<string>;
    params?: AnyObject<any>;
    fileTypes?: Array<string>;
    fileSize?: number;
    limit?: number;
    titles?: Array<string>;
    fixedSize?: Array<number>;
    isCalcHeight?: boolean;
  };
  collapse?: {
    defaultExpand?: boolean;
    showLimit?: number;
    remarkItems?: Array<{ fieldName: string; isLabel?: boolean }>;
    onCollapse?: AnyFunction<any>;
  };
  labelOptions: IFormItem;
  descOptions?: {
    content?: string | JSXNode;
    style?: CSSProperties;
    isTooltip?: boolean;
  };
  placeholder?: string;
  clearable?: boolean;
  readonly?: boolean;
  noResetable?: boolean;
  render?: AnyFunction<JSXNode>;
};

export type IFormDesc = Record<string, string>;

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

export type IDictDeep = IDict & {
  children?: Array<IDict> | Nullable<undefined>;
};

export const DATE_CONF = {
  date: {
    placeholder: t('qm.form.datePlaceholder'),
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  datetime: {
    placeholder: t('qm.form.timePlaceholder'),
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  exactdate: {
    placeholder: t('qm.form.datePlaceholder'),
    valueFormat: 'YYYY-MM-DD',
  },
  week: {
    placeholder: t('qm.form.weekPlaceholder'),
    valueFormat: 'YYYY-MM-DD',
  },
  month: {
    placeholder: t('qm.form.monthPlaceholder'),
    valueFormat: 'YYYY-MM',
  },
  year: {
    placeholder: t('qm.form.yearPlaceholder'),
    valueFormat: 'YYYY',
  },
};

export const DATE_RANGE_CONF = {
  daterange: {
    placeholder: t('qm.form.daterangePlaceholder'),
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  datetimerange: {
    placeholder: t('qm.form.timerangePlaceholder'),
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  exactdaterange: {
    placeholder: t('qm.form.daterangePlaceholder'),
    valueFormat: 'YYYY-MM-DD',
  },
  monthrange: {
    placeholder: t('qm.form.monthrangePlaceholder'),
    valueFormat: 'YYYY-MM',
  },
  yearrange: {
    placeholder: t('qm.form.yearrangePlaceholder'),
    valueFormat: 'YYYY',
  },
};

export const props = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      fieldName: PropTypes.string,
      label: PropTypes.string,
      labelWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      description: PropTypes.string,
      hidden: PropTypes.bool,
      invisible: PropTypes.bool,
      disabled: PropTypes.bool,
      rules: PropTypes.array,
      selfCols: PropTypes.number.def(1),
      offsetLeft: PropTypes.number.def(0),
      offsetRight: PropTypes.number.def(0),
      style: PropTypes.object,
      id: PropTypes.string,
      options: PropTypes.shape({
        itemList: PropTypes.array,
        secretType: PropTypes.oneOf(['finance', 'name', 'phone', 'IDnumber', 'bankNumber']),
        trueValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        falseValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        dateType: PropTypes.oneOf([
          'date',
          'datetime',
          'exactdate',
          'daterange',
          'datetimerange',
          'exactdaterange',
          'week',
          'month',
          'monthrange',
          'year',
          'yearrange',
        ]),
        minDateTime: PropTypes.string,
        maxDateTime: PropTypes.string,
        defaultTime: PropTypes.string,
        shortCuts: PropTypes.bool,
        unlinkPanels: PropTypes.bool,
        startDisabled: PropTypes.bool,
        endDisabled: PropTypes.bool,
        columns: PropTypes.Array,
        fieldAliasMap: PropTypes.func,
        onlySelect: PropTypes.bool,
        limit: PropTypes.number,
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,
        precision: PropTypes.number,
        controls: PropTypes.bool,
        minlength: PropTypes.number,
        maxlength: PropTypes.number,
        rows: PropTypes.number,
        maxrows: PropTypes.number,
        showLimit: PropTypes.bool,
        password: PropTypes.bool,
        noInput: PropTypes.bool,
        toUpper: PropTypes.bool,
        filterable: PropTypes.bool,
        collapseTags: PropTypes.bool,
        openPyt: PropTypes.bool,
        onInput: PropTypes.func,
        onClick: PropTypes.func,
        onDblClick: PropTypes.func,
        onEnter: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
      }),
      searchHelper: PropTypes.shape({
        name: PropTypes.string, // tds
        filters: PropTypes.array,
        initialValue: PropTypes.object,
        showFilterCollapse: PropTypes.bool,
        table: PropTypes.shape({
          fetch: PropTypes.object,
          columns: PropTypes.array,
          rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
          webPagination: PropTypes.bool,
        }),
        filterAliasMap: PropTypes.func,
        fieldAliasMap: PropTypes.func,
        getServerConfig: PropTypes.func, // tds
        fieldsDefine: PropTypes.object, // tds
        beforeOpen: PropTypes.func,
        open: PropTypes.func,
        closed: PropTypes.func,
      }),
      request: PropTypes.shape({
        fetchApi: PropTypes.func.isRequired,
        params: PropTypes.object,
        datakey: PropTypes.string,
        valueKey: PropTypes.string.def('value'),
        textKey: PropTypes.string.def('text'),
      }),
      upload: PropTypes.shape({
        actionUrl: PropTypes.string.isRequired,
        headers: PropTypes.object,
        params: PropTypes.object,
        fileTypes: PropTypes.array,
        fileSize: PropTypes.number,
        limit: PropTypes.number,
        titles: PropTypes.array,
        fixedSize: PropTypes.array,
        isCalcHeight: PropTypes.bool,
      }),
      collapse: PropTypes.shape({
        defaultExpand: PropTypes.bool,
        showLimit: PropTypes.number,
        remarkItems: PropTypes.array,
        onCollapse: PropTypes.func,
      }),
      labelOptions: PropTypes.object,
      descOptions: PropTypes.shape({
        content: PropTypes.any,
        style: PropTypes.object,
        isTooltip: PropTypes.bool,
      }),
      placeholder: PropTypes.string,
      readonly: PropTypes.bool,
      clearable: PropTypes.bool,
      noResetable: PropTypes.bool,
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
  size: {
    type: String as PropType<ComponentSize>,
    validator: isValidComponentSize,
  },
  uniqueKey: {
    type: String,
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
    validator: (val: string): boolean => {
      return ['default', 'search', 'onlyShow'].includes(val);
    },
  },
  isFieldsDefine: {
    type: Boolean,
    default: true,
  },
  isCollapse: {
    type: Boolean,
    default: true,
  },
  isSearchBtn: {
    type: Boolean,
    default: true,
  },
  isSubmitBtn: {
    type: Boolean,
    default: false,
  },
  fieldsChange: {
    type: Function as AnyFunction<void>,
    default: noop,
  },
};
