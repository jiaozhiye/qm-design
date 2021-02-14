/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 16:16:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-14 14:28:46
 */
import { ComponentSize } from './types';

export interface InstallOptions {
  size: ComponentSize;
  zIndex: number;
  locale?: any;
  i18n?: (...args: any[]) => string;
}

let $DESIGN = {} as InstallOptions;

const setConfig = (option: InstallOptions): void => {
  $DESIGN = option;
};

const getConfig = (key: keyof InstallOptions): unknown => {
  return $DESIGN[key];
};

export { getConfig, setConfig };
