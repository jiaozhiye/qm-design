/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 16:34:47
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode } from '../../_utils/types';
import { useGlobalConfig } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';

const prefixCls = getPrefixCls('spin');

export default defineComponent({
  name: 'QmSpin',
  componentName: 'QmSpin',
  inheritAttrs: false,
  props: {
    spinning: PropTypes.bool.def(false),
    delay: PropTypes.number.def(100),
    tip: PropTypes.string,
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  data() {
    return {
      sSpinning: this.spinning,
    };
  },
  watch: {
    spinning(val: boolean): void {
      console.log(22, val);
      this.stopTimer();
      if (!val) {
        this.sSpinning = val;
      } else {
        this.timer = setTimeout(() => (this.sSpinning = val), this.delay);
      }
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    stopTimer(): void {
      this.timer && clearTimeout(this.timer);
    },
    renderIndicator(): JSXNode {
      return (
        <span class={`${prefixCls}-dot ${prefixCls}-dot-spin`}>
          <i />
          <i />
          <i />
          <i />
        </span>
      );
    },
  },
  render(): JSXNode {
    const { tip, containerStyle, ...restProps } = this.$props;
    const { sSpinning } = this;

    const $DESIGN = useGlobalConfig();

    const spinClassName = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $DESIGN.size === 'medium',
      [`${prefixCls}--small`]: $DESIGN.size === 'small',
      [`${prefixCls}--mini`]: $DESIGN.size === 'mini',
      [`${prefixCls}-spinning`]: sSpinning,
      [`${prefixCls}-show-text`]: !!tip,
    };

    const spinElement: JSXNode = (
      <div {...restProps} class={spinClassName}>
        {this.renderIndicator()}
        {tip ? <div class={`${prefixCls}-text`}>{tip}</div> : null}
      </div>
    );

    const children = this.$slots.default?.();

    if (children) {
      const containerClassName = {
        [`${prefixCls}-container`]: true,
        [`${prefixCls}-blur`]: sSpinning,
      };
      return (
        <div class={`${prefixCls}-nested-loading`} style={containerStyle}>
          {sSpinning && <div key="loading">{spinElement}</div>}
          <div key="container" class={containerClassName} style={containerStyle}>
            {children}
          </div>
        </div>
      );
    }

    return spinElement;
  },
});
