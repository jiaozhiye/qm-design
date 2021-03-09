/*
 * @Author: 焦质晔
 * @Date: 2020-03-05 22:48:49
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-09 08:09:36
 */
import { defineComponent } from 'vue';
import PropTypes from '../../../_utils/vue-types';
import { getPrefixCls } from '../../../_utils/prefix';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'Radio',
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(false),
    trueValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(true),
    falseValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).def(false),
    label: PropTypes.string,
    readonly: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false),
    onChange: PropTypes.func,
  },
  data() {
    return {
      currentValue: this.modelValue,
      focusInner: false,
    };
  },
  watch: {
    modelValue() {
      this.updateValue();
    },
  },
  mounted() {
    this.updateValue();
  },
  methods: {
    change(event) {
      if (this.disabled || this.readonly) return;

      const checked = event.target.checked;
      this.currentValue = checked;

      const value = checked ? this.trueValue : this.falseValue;

      this.$emit('update:modelValue', value);
      this.$emit('change', value);
    },
    updateValue() {
      this.currentValue = this.modelValue === this.trueValue;
    },
    onBlur() {
      this.focusInner = false;
    },
    onFocus() {
      this.focusInner = true;
    },
  },
  render(): JSXNode {
    const prefixCls = getPrefixCls('radio');
    const wrapCls = {
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: this.currentValue,
      [`${prefixCls}-wrapper-disabled`]: this.disabled,
    };
    const radioCls = {
      [prefixCls]: true,
      [`${prefixCls}-checked`]: this.currentValue,
      [`${prefixCls}-disabled`]: this.disabled,
    };
    const innerCls = {
      [`${prefixCls}-inner`]: true,
      [`${prefixCls}-focus`]: this.focusInner,
    };
    const inputCls = [`${prefixCls}-input`];
    const textCls = [`${prefixCls}-text`];
    return (
      <label class={wrapCls}>
        <span class={radioCls}>
          <span class={innerCls}></span>
          <input
            type="radio"
            class={inputCls}
            readonly={this.readonly}
            disabled={this.disabled}
            checked={this.currentValue}
            onChange={this.change}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
          />
        </span>
        {this.label && <span class={textCls}>{this.label}</span>}
      </label>
    );
  },
});
