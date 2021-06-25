/*
 * @Author: 焦质晔
 * @Date: 2020-03-20 10:18:05
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-25 10:00:26
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import { getPrefixCls } from '../../../_utils/prefix';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'FullScreen',
  inject: ['$$table'],
  data() {
    return {
      isFull: false,
    };
  },
  computed: {
    title(): string {
      return !this.isFull ? t('qm.table.screen.full') : t('qm.table.screen.cancelFull');
    },
  },
  methods: {
    clickHandle(): void {
      this.$$table.isFullScreen = this.isFull = !this.isFull;
    },
    keyboardHandle(ev: KeyboardEvent): void {
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
  beforeUnmount() {
    this.event?.remove();
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
