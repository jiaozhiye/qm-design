/*
 * @Author: 焦质晔
 * @Date: 2020-06-01 13:23:53
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-23 21:47:17
 */
import { addResizeListener, removeResizeListener } from '../../_utils/resize-event';
import { debounce } from '../../_utils/util';

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
    resizeListener() {
      const c = Math.floor(this.$refs[`form`].$el.offsetWidth / 300);
      let cols = 24 % c === 0 ? c : c - 1;
      cols = cols < 2 ? 2 : cols;
      cols = cols > 6 ? 6 : cols;
      this.flexCols = typeof this.cols === 'undefined' ? cols : this.cols;
    },
    bindResizeEvent() {
      addResizeListener(this.$refs[`form`].$el, debounce(this.resizeListener, 100));
    },
    removeResizeEvent() {
      removeResizeListener(this.$refs[`form`].$el, this.resizeListener);
    },
  },
};
