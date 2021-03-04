/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-04 10:55:01
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../_utils/types';
import { noop } from './utils';

import Divider from '../../divider';

export default defineComponent({
  name: 'FormDivider',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  render(): JSXNode {
    const { blockFieldNames, view, desc, expand } = this.$$form;
    const { type, label, fieldName, style = {}, options = {}, collapse } = this.option;
    const { showLimit, remarkItems = [], onCollapse = noop } = collapse || {};
    const result = [];
    if (remarkItems.length) {
      const blockList = blockFieldNames.find((arr) => arr[0].fieldName === fieldName) ?? [];
      const index = showLimit ?? blockList.length - 1;
      blockList.slice(index + 1).forEach((x) => {
        const item = remarkItems.find((k) => k.fieldName === x.fieldName);
        if (!item) return;
        let label = item.isLabel ? `${x.label}：` : '';
        let textVal = view[x.fieldName] ?? '';
        let descVal = desc[x.fieldName] ?? '';
        if (textVal === '') return;
        result.push({ ...x, text: `${label}${textVal} ${descVal}` });
      });
    }
    const wrapProps = {
      collapse: expand[fieldName],
      label,
      extra: result.map((x) => x.text).join(' | '),
      style: { ...style },
      'onUpdate:collapse': (val: boolean): void => {
        expand[fieldName] = val;
      },
      onChange: (val: boolean): void => {
        onCollapse(val);
      },
    };
    // @ts-ignore
    return <Divider {...wrapProps} />;
  },
});
