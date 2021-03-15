/*
 * @Author: 焦质晔
 * @Date: 2021-03-06 15:11:01
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 12:48:49
 */
import { AnyFunction, AnyObject, JSXNode, Nullable } from '../../../_utils/types';

export type IFixed = 'left' | 'right';

export type IAlign = 'left' | 'center' | 'right';

export type IFilterType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date';

export type IEditerType = 'text' | 'number' | 'select' | 'select-multiple' | 'checkbox' | 'switch' | 'search-helper' | 'date' | 'datetime' | 'time';

export type ISelectionType = 'checkbox' | 'radio';

export type IFormatType =
  | 'date'
  | 'datetime'
  | 'dateShortTime'
  | 'finance'
  | 'secret-name'
  | 'secret-phone'
  | 'secret-IDnumber'
  | 'secret-bankNumber';

export type IDict = {
  text: string;
  value: string;
  disabled?: boolean;
};

export type IDictDeep = IDict & {
  children?: Array<IDict> | Nullable<undefined>;
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
    fieldAliasMap?: AnyFunction<Record<string, string>>;
    beforeOpen?: AnyFunction<void | Promise<void> | boolean>;
    opened?: AnyFunction<void>;
    beforeClose?: AnyFunction<void | Promise<void> | boolean>;
    closed?: AnyFunction<void>;
  };
  rules?: Array<{
    required?: boolean;
    message?: string;
    validator?: AnyFunction<boolean>;
  }>;
  onInput?: AnyFunction<void>;
  onChange?: AnyFunction<void>;
  onEnter?: AnyFunction<void>;
  onClick?: AnyFunction<void>;
};

export type IFetch = {
  api: AnyFunction<Promise<any>>;
  params?: AnyObject<any>;
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
  width?: number | string;
  fixed?: IFixed;
  align?: IAlign;
  theadAlign?: IAlign;
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
  render?: AnyFunction<JSXNode>;
  extraRender?: AnyFunction<string | number>;
};
