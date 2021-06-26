/*
 * @Author: 焦质晔
 * @Date: 2021-03-06 15:11:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-18 09:10:10
 */
import { AnyFunction, AnyObject, ComponentSize, JSXNode, Nullable } from '../../../_utils/types';

export type ITableSize = 'default' | ComponentSize;

export type IFixed = 'left' | 'right';

export type IAlign = 'left' | 'center' | 'right';

export type IFilterType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date';

export type IEditerType = 'text' | 'number' | 'select' | 'select-multiple' | 'checkbox' | 'switch' | 'search-helper' | 'date' | 'datetime' | 'time';

export type ISelectionType = 'checkbox' | 'radio';

export type IFormatType =
  | 'date'
  | 'datetime'
  | 'dateShortTime'
  | 'percent'
  | 'finance'
  | 'secret-name'
  | 'secret-phone'
  | 'secret-IDnumber'
  | 'secret-bankNumber';

export type ICellSpan = {
  rowspan: number;
  colspan: number;
};

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

export type IDictDeep = IDict & {
  children?: Array<IDict> | Nullable<undefined>;
};

export type IRule = {
  required?: boolean;
  message?: string;
  validator?: AnyFunction<boolean>;
};

export type IFilter = {
  [key: string]: any;
};

export type ISorter = {
  [key: string]: string;
};

export type ISuperFilter = {
  type: string;
  bracketLeft: string;
  fieldName: string;
  expression: string;
  value: unknown;
  bracketRright: string;
  logic: string;
};

export type IEditerReturn = {
  type: IEditerType;
  items?: Array<IDict>;
  editable?: boolean;
  disabled?: boolean;
  extra?: {
    maxlength?: number;
    max?: number;
    min?: number;
    trueValue?: string | number;
    falseValue?: string | number;
    minDateTime?: string;
    maxDateTime?: string;
    text?: string;
    disabled?: boolean;
    clearable?: boolean;
  };
  helper?: {
    filters?: AnyObject<any>;
    table?: AnyObject<any>;
    remoteMatch?: boolean;
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    beforeOpen?: AnyFunction<void | Promise<void> | boolean>;
    opened?: AnyFunction<void>;
    beforeClose?: AnyFunction<void | Promise<void> | boolean>;
    closed?: AnyFunction<void>;
  };
  rules?: IRule[];
  onInput?: AnyFunction<void>;
  onChange?: AnyFunction<void>;
  onEnter?: AnyFunction<void>;
  onClick?: AnyFunction<void>;
};

export type IFetchParams = AnyObject<unknown> & {
  currentPage: number;
  pageSize: number;
};

export type IFetch = {
  api: AnyFunction<Promise<any>>;
  params?: IFetchParams;
  beforeFetch?: AnyFunction<boolean>;
  xhrAbort?: boolean;
  stopToFirst?: boolean;
  dataKey?: string;
  callback?: AnyFunction<void>;
};

export type IColumn = {
  dataIndex: string;
  title: string;
  description?: string;
  colSpan?: number;
  rowSpan?: number;
  width?: number | string;
  renderWidth?: number | null;
  fixed?: IFixed;
  align?: IAlign;
  printFixed?: boolean;
  hidden?: boolean;
  ellipsis?: boolean;
  className?: string;
  children?: Array<IColumn> | Nullable<undefined>;
  sorter?: boolean | AnyFunction<void>;
  filter?: {
    type?: IFilterType;
    items?: Array<IDict>;
  };
  precision?: number;
  formatType?: IFormatType;
  required?: boolean;
  editRender?: AnyFunction<IEditerReturn>;
  dictItems?: Array<IDict>;
  summation?: {
    sumBySelection?: boolean;
    dataKey?: string;
    unit?: string;
    render?: AnyFunction<JSXNode>;
    onChange?: AnyFunction<void>;
  };
  groupSummary?:
    | boolean
    | {
        dataKey?: string;
        unit?: string;
        render?: AnyFunction<JSXNode>;
      };
  render?: AnyFunction<JSXNode | string | number>;
  extraRender?: AnyFunction<string | number>;
};

export type IDerivedColumn = IColumn & {
  type?: string;
  level?: number;
  parentDataIndex?: string;
  firstFixedRight?: boolean;
  lastFixedLeft?: boolean;
};

export type IDerivedRowKey = {
  rowKey: string | number;
  parentRowKey?: string;
  children?: IDerivedRowKey[];
};

export type IRecord<T = any> = {
  [key: string]: T;
};
