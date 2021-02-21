/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-21 19:25:57
 */
import { defineComponent, VNode, ComponentInternalInstance, PropType } from 'vue';
import addEventListener from 'add-dom-event-listener';
import scrollIntoView from 'scroll-into-view-if-needed';
import { JSXNode } from '../../_utils/types';
import { isNumber } from 'lodash-es';
import { isValidWidthUnit } from '../../_utils/validators';

import { getParserWidth, throttle, useGlobalConfig } from '../../_utils/util';
import { getValidSlot, getInstanceFromSlot } from '../../_utils/instance-children';
import { getPrefixCls } from '../../_utils/prefix';

import AnchorNav from './anchor-nav';

const ANCHOR_ITEM_NAME = 'QmAnchorItem';
const prefixCls = getPrefixCls('anchor');

export default defineComponent({
  name: 'QmAnchor',
  componentName: 'QmAnchor',
  props: {
    labelWidth: {
      type: [Number, String] as PropType<number | string>,
      default: 80,
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
  },
  data() {
    (this as any).distances = [] as Array<number>;
    return {
      activeKey: 0,
      anchorItemInstances: [],
    };
  },
  mounted() {
    this.anchorItemInstances = this.getAnchorItems();
    this.distances = this.createDistances();
    this.scrollEvent = addEventListener(
      this.$refs[`scroll`],
      'scroll',
      throttle(this.scrollHandle, 20)
    );
  },
  beforeUnmount() {
    this.scrollEvent?.remove();
  },
  methods: {
    getAnchorItems(): Array<ComponentInternalInstance> {
      const { _: instance } = this;
      const { children } = instance.subTree;
      const content: VNode = Array.from(children as ArrayLike<VNode>).find(({ props }) => {
        return props.class === `${prefixCls}__container`;
      });
      return getInstanceFromSlot(content, ANCHOR_ITEM_NAME);
    },
    createDistances(): Array<number> {
      return this.anchorItemInstances.map((x) => x.ctx.$el.offsetTop);
    },
    findCurrentIndex(t: number): number {
      const top: number = Math.abs(t);
      let index: number = -1;
      for (let i = 0; i < this.distances.length; i++) {
        const t1: number = this.distances[i];
        const t2: number = this.distances[i + 1] || 10000;
        if (top >= t1 && top < t2) {
          index = i;
        }
      }
      return index;
    },
    scrollHandle(ev: Event): void {
      const index: number = this.findCurrentIndex((ev.target as any).scrollTop);
      if (index === -1) return;
      this.activeKey = index;
    },
    tabClickHandle(index: number): void {
      this.activeKey = index;
      scrollIntoView(this.anchorItemInstances[index].ctx.$el, {
        scrollMode: 'always',
        block: 'start',
        behavior: 'smooth',
        boundary: this.$refs[`scroll`],
      });
    },
  },
  render(): JSXNode {
    const { activeKey, labelWidth, anchorItemInstances } = this;
    const $DESIGN = useGlobalConfig();
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $DESIGN.size === 'medium',
      [`${prefixCls}--small`]: $DESIGN.size === 'small',
      [`${prefixCls}--mini`]: $DESIGN.size === 'mini',
    };
    return (
      <div class={cls}>
        <div class={`${prefixCls}__label`} style={{ width: getParserWidth(labelWidth) }}>
          <AnchorNav
            activeKey={activeKey}
            anchor-items={anchorItemInstances}
            onTabClick={this.tabClickHandle}
          />
        </div>
        <div ref="scroll" class={`${prefixCls}__container`}>
          {getValidSlot(this.$slots.default?.(), ANCHOR_ITEM_NAME)}
        </div>
      </div>
    );
  },
});
