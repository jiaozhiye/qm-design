/*
 * @Author: 焦质晔
 * @Date: 2021-02-20 10:51:11
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 15:07:46
 */
import { isNumber } from 'lodash-es';

export const isValidWidthUnit = (val: string | number): boolean => {
  if (isNumber(val)) {
    return true;
  } else {
    return ['px', 'rem', 'em', 'vw', 'vh', '%'].some((unit) => (val as string).endsWith(unit));
  }
  return false;
};

export const isValidComponentSize = (val: string): boolean =>
  ['', 'medium', 'small', 'mini'].includes(val);
