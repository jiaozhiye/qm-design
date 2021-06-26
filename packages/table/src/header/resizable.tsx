/*
 * @Author: 焦质晔
 * @Date: 2020-03-07 19:04:14
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-22 14:53:54
 */
import { defineComponent } from 'vue';
import { isUndefined, isNull } from 'lodash-es';
import { prevent } from '../../../_utils/dom';
import { getNodeOffset } from '../utils';
import { JSXNode } from '../../../_utils/types';

import config from '../config';

export default defineComponent({
  name: 'Resizable',
  props: ['column'],
  inject: ['$$table'],
  computed: {
    $resizableBar() {
      return this.$$table.$refs[`resizable-bar`];
    },
  },
  methods: {
    resizeMousedown(ev: MouseEvent): boolean {
      prevent(ev);

      const _this = this;
      const dom = ev.target as HTMLElement;
      const { elementStore, $$tableBody, columns, doLayout, setLocalColumns } = this.$$table;
      const target = this.$resizableBar;

      const half = dom.offsetWidth / 2;
      const disX = ev.clientX;
      const left = getNodeOffset(dom, elementStore[`$table`]).left - $$tableBody.$el.scrollLeft + half;

      elementStore[`$table`].classList.add('c--resize');
      target.style.left = `${left}px`;
      target.style.display = 'block';

      const renderWidth = this.column.width || this.column.renderWidth;
      let res = renderWidth;

      document.onmousemove = function (ev) {
        let ml = ev.clientX - disX;
        let rw = renderWidth + ml;

        if (isUndefined(res) || isNull(res)) return;
        // 左边界限定
        if (rw < config.defaultColumnWidth) return;
        res = Number.parseInt(rw);

        target.style.left = `${ml + left}px`;
      };

      document.onmouseup = function () {
        elementStore[`$table`].classList.remove('c--resize');
        target.style.display = 'none';

        this.onmousemove = null;
        this.onmouseup = null;

        if (isUndefined(res) || isNull(res)) return;

        _this.column.renderWidth = res;
        // _this.$set(_this.column, 'width', res);
        _this.column.width = res;

        doLayout();
        setLocalColumns(columns);
      };

      return false;
    },
  },
  render(): JSXNode {
    const { resizable, bordered } = this.$$table;
    const resizableCls = {
      [`resizable`]: true,
      [`is--line`]: resizable && !bordered,
    };
    return <div class={resizableCls} onMousedown={this.resizeMousedown} />;
  },
});
