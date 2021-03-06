/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:28:32
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 15:06:16
 */
import { getCurrentInstance, ComponentInternalInstance } from 'vue';
import { InstallOptions } from '../_utils/config';
import { Nullable } from '../_utils/types';

export const useGlobalConfig = (): Partial<InstallOptions> => {
  const vm: Nullable<ComponentInternalInstance> = getCurrentInstance();

  if (!vm?.proxy) return {};

  if ('$DESIGN' in vm.proxy) {
    return (vm.proxy as any).$DESIGN;
  }

  return {};
};
