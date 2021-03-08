/*
 * @Author: 焦质晔
 * @Date: 2020-08-11 08:19:36
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 10:24:54
 */
import { defineComponent } from 'vue';
import { JSXNode } from '../../../_utils/types';
import PropTypes from '../../../_utils/vue-types';

import { useSize } from '../../../hooks/useSize';

export default defineComponent({
  name: 'InputText',
  emits: ['update:modelValue', 'change', 'nativeInput'],
  props: {
    modelValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.string,
    maxlength: PropTypes.number,
    placeholder: PropTypes.string,
    readonly: PropTypes.bool.def(false),
    clearable: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false),
  },
  data() {
    return {
      currentValue: '',
    };
  },
  watch: {
    modelValue: {
      handler(val) {
        this.setValueHandle(val);
      },
      immediate: true,
    },
  },
  methods: {
    setValueHandle(val) {
      this.currentValue = val;
    },
    emitEventHandle(val) {
      this.$emit('update:modelValue', val);
      this.$emit('change', val);
    },
    focus() {
      this.$refs['input']?.focus();
    },
    blur() {
      this.$refs['input']?.blur();
    },
    select() {
      this.$refs['input']?.select();
    },
  },
  render(): JSXNode {
    const { currentValue, maxlength, placeholder, readonly, clearable, disabled } = this;
    const { $size } = useSize(this.$props);
    const wrapProps = {
      modelValue: currentValue,
      'onUpdate:modelValue': (val) => {
        if (readonly) return;
        this.currentValue = val;
        this.$emit('nativeInput', val);
      },
    };
    return (
      <el-input
        ref="input"
        {...wrapProps}
        size={$size}
        maxlength={maxlength}
        placeholder={placeholder}
        disabled={disabled}
        clearable={clearable}
        onChange={(val) => {
          this.setValueHandle(val);
          this.emitEventHandle(val);
        }}
        nativeOnClick={(ev) => {
          if (Array.from(ev.target.classList).includes('el-input__clear')) {
            ev.stopPropagation();
          }
        }}
        v-slots={{
          append: (): JSXNode => this.$slots[`append`]?.() ?? null,
        }}
      />
    );
  },
});
