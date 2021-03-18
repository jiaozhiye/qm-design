/*
 * @Author: 焦质晔
 * @Date: 2020-03-07 19:04:14
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 20:27:56
 */
import { defineComponent } from 'vue';
import { getNodeOffset } from '../utils';
import { clearSelections } from '../../../_utils/dom';
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
    resizeMousedown(ev) {
      const _this = this;
      const dom = ev.target;
      const { $vTable, $$tableBody, columns, doLayout, setLocalColumns } = this.$$table;
      const target = this.$resizableBar;

      const half = dom.offsetWidth / 2;
      const disX = ev.clientX;
      const left = getNodeOffset(dom, $vTable).left - $$tableBody.$el.scrollLeft + half;

      $vTable.classList.add('c--resize');
      target.style.left = `${left}px`;
      target.style.display = 'block';

      const renderWidth = this.column.width || this.column.renderWidth;
      let res = renderWidth;

      document.onmousemove = function (ev) {
        let ml = ev.clientX - disX;
        let rw = renderWidth + ml;

        // 左边界限定
        if (rw < config.defaultColumnWidth) return;
        res = rw;
        target.style.left = `${ml + left}px`;

        clearSelections();
      };

      document.onmouseup = function () {
        $vTable.classList.remove('c--resize');
        target.style.display = 'none';

        _this.column.renderWidth = res;
        // _this.$set(_this.column, 'width', res);
        _this.column.width = res;

        doLayout();
        setLocalColumns(columns);

        this.onmousemove = null;
        this.onmouseup = null;
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
