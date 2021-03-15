/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-06 09:13:58
 */
import { defineComponent, PropType } from 'vue';
import { CountUp } from 'countup.js';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, ComponentSize } from '../../_utils/types';

import { isFunction } from 'lodash-es';
import { useSize } from '../../hooks/useSize';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';

export default defineComponent({
  name: 'QmCountup',
  componentName: 'QmCountup',
  emits: ['ready'],
  props: {
    endValue: PropTypes.number.isRequired,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    delay: PropTypes.number.def(0),
    options: PropTypes.object.def({}),
  },
  data() {
    this.instance = null;
    return {};
  },
  watch: {
    endValue(value: number): void {
      if (this.instance && isFunction(this.instance.update)) {
        this.instance.update(value);
      }
    },
  },
  mounted() {
    this.create();
  },
  unmounted() {
    this.instance = null;
  },
  methods: {
    create() {
      this.instance = new CountUp(this.$refs.countup, this.endValue, this.options) || { error: true };
      if (this.instance.error) return;
      setTimeout(() => {
        this.instance.start(() => {
          this.$emit('ready', this.instance, CountUp);
        });
      }, this.delay);
    },
    printValue(value) {
      if (this.instance && isFunction(this.instance.printValue)) {
        return this.instance.printValue(value);
      }
    },
    start(callback) {
      if (this.instance && isFunction(this.instance.start)) {
        return this.instance.start(callback);
      }
    },
    pauseResume() {
      if (this.instance && isFunction(this.instance.pauseResume)) {
        return this.instance.pauseResume();
      }
    },
    reset() {
      if (this.instance && isFunction(this.instance.reset)) {
        return this.instance.reset();
      }
    },
    update(newEndVal) {
      if (this.instance && isFunction(this.instance.update)) {
        return this.instance.update(newEndVal);
      }
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('countup');
    const { $size } = useSize(this.$props);
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };
    return <span ref="countup" class={cls} />;
  },
});
