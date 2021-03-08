/*
 * @Author: 焦质晔
 * @Date: 2021-03-08 13:54:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 16:43:32
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';

import { getPrefixCls } from '../../../_utils/prefix';
import config from '../config';

export default defineComponent({
  name: 'Pager',
  props: ['size', 'total', 'currentPage', 'pageSize', 'layout', 'pagerCount', 'pageSizeOptions', 'extraRender'],
  data() {
    return {};
  },
  render(): JSXNode {
    const { $props } = this;
    const { currentPage, pageSize, pageSizeOptions } = config.pagination;
    const prefixCls = getPrefixCls('table-pager');
    const pageProps = {
      size: $props.size || currentPage,
      total: $props.total || 0,
      currentPage: $props.currentPage || 1,
      pageSize: $props.pageSize || pageSize,
      layout: $props.layout || 'prev, pager, next, jumper, sizes, total',
      pageSizes: $props.pageSizeOptions || pageSizeOptions,
    };
    const cls = {
      [prefixCls]: true,
    };
    return (
      <div class={cls}>
        <el-pagination {...pageProps} />
      </div>
    );
  },
});
