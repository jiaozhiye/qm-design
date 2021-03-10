/*
 * @Author: 焦质晔
 * @Date: 2020-03-20 10:18:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 14:52:20
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import { JSXNode } from '../../../_utils/types';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';

export default defineComponent({
  name: 'FullScreen',
  inject: ['$$table'],
  data() {
    return {
      isFull: false,
    };
  },
  computed: {
    title() {
      return !this.isFull ? t('1m.table.screen.full') : t('1m.table.screen.cancelFull');
    },
  },
  methods: {
    clickHandle() {
      this.$$table.isFullScreen = this.isFull = !this.isFull;
    },
    keyboardHandle(ev) {
      if (!this.isFull) return;
      // Esc 取消
      if (ev.keyCode === 27) {
        this.$$table.isFullScreen = this.isFull = false;
      }
    },
  },
  mounted() {
    this.event = addEventListener(document, 'keydown', this.keyboardHandle);
  },
  unmounted() {
    this.event.remove();
  },
  render(): JSXNode {
    const { isFull, title } = this;
    const prefixCls = getPrefixCls('table');
    const iconCls = [
      `iconfont`,
      {
        [`icon-fullscreen`]: !isFull,
        [`icon-fullscreen-exit`]: isFull,
      },
    ];
    return (
      <span class={`${prefixCls}-full-screen`} title={title} onClick={this.clickHandle}>
        <i class={iconCls} />
      </span>
    );
  },
});
