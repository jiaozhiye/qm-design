/*
 * @Author: 焦质晔
 * @Date: 2021-03-15 14:48:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-15 15:28:48
 */
import { getCurrentInstance, ComponentInternalInstance } from 'vue';

export const useDispatch = function (componentName: string, eventName: string, params: unknown): void {
  let vm: ComponentInternalInstance = getCurrentInstance();

  vm = vm || this;
  if (!vm) return;

  let parent = vm.parent || vm.root;
  let name = (parent.type as any).componentName || parent.type.name;

  while (parent && (!name || name !== componentName)) {
    parent = parent.parent;
    if (parent) {
      name = (parent.type as any).componentName || parent.type.name;
    }
  }

  if (parent) {
    parent.emit(eventName, params);
  }
};
