/*
 * @Author: 焦质晔
 * @Date: 2020-06-01 13:23:53
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-31 09:48:28
 */
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import { debounce } from '../../_utils/util';

const COL_WIDTH = 300;

export const FormColsMixin = {
  data() {
    return {
      flexCols: 4, // 默认
    };
  },
  mounted() {
    this.bindResizeEvent();
  },
  beforeUnmount() {
    this.removeResizeEvent();
  },
  methods: {
    resizeListener(): void {
      const w: number = this.$refs[`form`].$el.offsetWidth;
      if (w === 0) return;
      let cols = Math.floor(w / COL_WIDTH);
      cols = 24 % cols === 0 ? cols : cols - 1;
      cols = cols < 1 ? 1 : cols;
      cols = cols > 8 ? 8 : cols;
      this.flexCols = typeof this.cols === 'undefined' ? cols : this.cols;
    },
    bindResizeEvent(): void {
      addResizeListener(this.$refs[`form`].$el, debounce(this.resizeListener, 100));
    },
    removeResizeEvent(): void {
      removeResizeListener(this.$refs[`form`].$el, this.resizeListener);
    },
  },
};
