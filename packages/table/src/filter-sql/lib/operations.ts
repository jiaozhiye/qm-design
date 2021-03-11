/*
 * @Author: 焦质晔
 * @Date: 2020-07-11 13:39:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 09:26:25
 */
// 模糊搜索中需要转义的特殊字符
const SPAN_CHAR_REG = /(\^|\.|\[|\$|\(|\)|\||\*|\+|\?|\{|\\)/g;

const PRIMITIVE_VALUES: string[] = ['string', 'number', 'boolean', 'symbol'];

const escapeKeyword = (keyword: string): string => {
  keyword = keyword ?? '';
  return keyword.toString().replace(SPAN_CHAR_REG, '\\$1');
};

const isPrimitive = (value: any): boolean => {
  return PRIMITIVE_VALUES.includes(typeof value);
};

const isDate = (value: any): boolean => {
  if (typeof value !== 'string') {
    return false;
  }
  return /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/.test(value as string);
};

/**
 * 解析 where 条件的各种情况
 * @param {any} value 数据值
 * @param {string} expression 标记符
 * @param {any} condition 条件值
 * @returns {boolean}
 */
export const matchWhere = (value: any, expression: string, condition: any): boolean => {
  value = isDate(value) ? value.slice(0, 10) : value;
  let res = true;
  switch (expression) {
    case 'like': {
      // 把 ^ 还原为 空格
      const keyword = new RegExp(escapeKeyword((condition as string).replace(/\^/g, ' ')), 'i');
      res = !!(value ?? '').toString().match(keyword);
      break;
    }
    case 'likes': {
      const conditions: string[] = (condition as string).split(/,|，/);
      res = conditions.some((condition: string): boolean => {
        // 把 ^ 还原为 空格
        const keyword = new RegExp(escapeKeyword((condition as string).replace(/\^/g, ' ')), 'i');
        return !!(value ?? '').toString().match(keyword);
      });
      break;
    }
    case 'in': {
      if (isPrimitive(condition)) {
        condition = [condition];
      }
      if (Array.isArray(condition)) {
        res = Array.isArray(value) ? condition.every((x) => value.includes(x)) : condition.includes(value);
      }
      break;
    }
    case 'nin': {
      if (isPrimitive(condition)) {
        condition = [condition];
      }
      if (Array.isArray(condition)) {
        res = !(Array.isArray(value) ? condition.some((x) => value.includes(x)) : condition.includes(value));
      }
      break;
    }
    case '!=':
    case '<>': {
      res = value != condition;
      break;
    }
    case '<': {
      res = value < condition;
      break;
    }
    case '<=': {
      res = value <= condition;
      break;
    }
    case '>': {
      res = value > condition;
      break;
    }
    case '>=': {
      res = value >= condition;
      break;
    }
    case '==':
    default: {
      res = value == condition;
    }
  }
  return res;
};
