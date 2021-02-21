/*
 * @Author: 焦质晔
 * @Date: 2021-02-21 09:20:14
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 10:54:55
 */
import { VNode, Component, ComponentInternalInstance, Fragment } from 'vue';

export const getValidSlot = (slots: VNode[] = [], name: string) => {
  return slots.filter((node) => {
    let type = node.type;
    type = (type as Component).name || type;
    return type === name;
  });
};

export const getInstanceFromSlot = (
  vnode: VNode,
  name: string,
  instanceList: ComponentInternalInstance[] = []
) => {
  Array.from((vnode.children || []) as ArrayLike<VNode>).forEach((node) => {
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
