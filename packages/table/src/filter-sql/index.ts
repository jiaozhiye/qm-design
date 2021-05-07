/*
 * @Author: 焦质晔
 * @Date: 2020-07-11 10:51:46
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 17:40:38
 */
import sf from './lib/filter_string';
import vr from './lib/variables_replacement';
import { matchWhere } from './lib/operations';

const _query = (...rest) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return matchWhere(...rest);
};

export const stringify = sf.stringify;

export const array_format = sf.array_format;

export const isBracketBalance = vr.isBracketBalance;

export const where = (array, query) => {
  const result: string[] = [];

  // Replace AND and OR to && and ||
  query = sf.replace_symbols(query);
  query = vr.replace_variables(query, 'array[i]');
  // console.log(`Conditionals`, query);

  for (let i = 0; i < array.length; i++) {
    if (eval(query)) {
      result.push(array[i]);
    }
  }

  return result;
};
