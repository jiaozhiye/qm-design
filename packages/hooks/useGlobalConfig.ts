/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:28:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 08:29:00
 */
import { getCurrentInstance } from 'vue';
import { InstallOptions } from '../_utils/config';

export const useGlobalConfig = (): Partial<InstallOptions> => {
  const vm: any = getCurrentInstance();
  if ('$DESIGN' in vm.proxy) {
    return vm.proxy.$DESIGN;
  }
  return {};
};
