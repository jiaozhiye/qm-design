/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-05 12:26:28
 */
import { defineComponent, PropType } from 'vue';
import { JSXNode } from '../../_utils/types';

import { getPosition } from '../../_utils/dom';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';

export default defineComponent({
  name: 'ResizeBar',
  inject: ['$$split'],
  emits: ['update:dragging', 'drag'],
  props: ['direction', 'dragging', 'onDrag'],
  methods: {
    dragStart(ev: MouseEvent): void {
      ev.preventDefault();
      this.$emit('update:dragging', true);
      document.addEventListener('mousemove', this.moving, { passive: true });
      document.addEventListener('mouseup', this.dragStop, { passive: true, once: true });
    },
    dragStop(): void {
      document.removeEventListener('mousemove', this.moving);
      this.$emit('update:dragging', false);
    },
    mouseOffset({ pageX, pageY }): number {
      const container: HTMLElement = this.$$split.$refs[`split`];
      const containerOffset = getPosition(container);
      let offset: number;
      if (this.direction === 'vertical') {
        offset = pageY - containerOffset.y;
        offset = Math.min(offset, container.offsetHeight);
      } else {
        offset = pageX - containerOffset.x;
        offset = Math.min(offset, container.offsetWidth);
      }
      return Math.max(offset, 0);
    },
    moving(ev: MouseEvent): void {
      this.$emit('drag', this.mouseOffset(ev));
    },
  },
  render(): JSXNode {
    const { direction } = this;
    const prefixCls = getPrefixCls('split');
    const cls = {
      [`${prefixCls}__resize-bar`]: true,
      vertical: direction === 'vertical',
      horizontal: direction === 'horizontal',
    };
    return <div class={cls} title={t('qm.split.resize')} onMousedown={this.dragStart} />;
  },
});
