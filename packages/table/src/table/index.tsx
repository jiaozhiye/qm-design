/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 09:33:59
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';

import { getPrefixCls } from '../../../_utils/prefix';
import { useSize } from '../../../hooks/useSize';
import baseProps from './props';

import { isEqual } from 'lodash-es';
import { debounce, isEmpty } from '../../../_utils/util';
import { getScrollBarWidth } from '../../../_utils/scrollbar-width';
import { warn } from '../../../_utils/error';
import { columnsFlatMap, getAllColumns, getAllRowKeys, tableDataFlatMap, createOrderBy, createWhereSQL, parseHeight } from '../utils';

import columnsMixin from '../columns';
import expandableMixin from '../expandable/mixin';
import selectionMixin from '../selection/mixin';

export default defineComponent({
  name: 'QmTable',
  componentName: 'QmTable',
  inheritAttrs: false,
  props: {
    ...baseProps,
  },
  provide() {
    return {
      $$table: this,
    };
  },
  data() {
    return {};
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('table');
    const { $size } = useSize(this.$props);
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };
    return <div class={cls}>table</div>;
  },
});
