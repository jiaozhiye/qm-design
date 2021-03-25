/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 13:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 15:03:02
 */
import { defineComponent } from 'vue';
import { getPrefixCls } from '../../../_utils/prefix';
import { JSXNode } from '../../../_utils/types';

import config from '../config';

export default defineComponent({
  name: 'Pager',
  props: ['size', 'total', 'currentPage', 'pageSize', 'layout', 'pagerCount', 'pageSizeOptions'],
  emits: ['current-change', 'size-change'],
  render(): JSXNode {
    const { $props } = this;
    const { currentPage, pageSize, pageSizeOptions } = config.pagination;
    const prefixCls = getPrefixCls('table');
    const pageProps = {
      size: $props.size,
      total: $props.total || 0,
      currentPage: $props.currentPage || currentPage,
      pageSize: $props.pageSize || pageSize,
      layout: $props.layout || 'prev, pager, next, jumper, sizes',
      pageSizes: $props.pageSizeOptions || pageSizeOptions,
      background: true,
      onCurrentChange: (val: number): void => {
        this.$emit('current-change', { currentPage: val, pageSize: $props.pageSize });
      },
      onSizeChange: (val: number): void => {
        this.$emit('size-change', { currentPage: $props.currentPage, pageSize: val });
      },
    };
    const cls = {
      [`${prefixCls}-pager`]: true,
    };
    return (
      <div class={cls}>
        <el-pagination {...pageProps} />
      </div>
    );
  },
});
