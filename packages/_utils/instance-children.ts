/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 09:20:14
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-03 12:36:24
 */
import { VNode, Component, ComponentInternalInstance, Fragment } from 'vue';

export const getValidSlot = (vnodes: VNode[] = [], name: string): VNode[] => {
  const $slots: VNode[] = [];
  vnodes
    .filter((node) => {
      let type = node.type;
      type = (type as Component).name || type;
      if (type === Fragment) {
        return true;
      }
      return type === name;
    })
    .forEach((node) => {
      if (node.type === Fragment) {
        $slots.push(...((node.children || []) as VNode[]));
      } else {
        $slots.push(node);
      }
    });
  return $slots;
};

export const getInstanceFromSlot = (
  vnode: VNode,
  name: string,
  instanceList: ComponentInternalInstance[] = []
) => {
  Array.from((vnode.children || []) as ArrayLike<VNode>).forEach((node: VNode) => {
    let type = node.type;
    type = (type as Component).name || type;
    if (type === name && node.component) {
      instanceList.push(node.component);
    } else if (type === Fragment || type === 'template') {
      getInstanceFromSlot(node, name, instanceList);
    }
  });
  return instanceList;
};
