/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-26 13:14:01
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, AnyFunction, ComponentSize } from '../../_utils/types';

import { isFunction } from 'lodash-es';
import { useSize } from '../../hooks/useSize';
import { sleep } from '../../_utils/util';
import { t } from '../../locale';
import { isValidComponentSize } from '../../_utils/validators';

export default defineComponent({
  name: 'QmButton',
  componentName: 'QmButton',
  inheritAttrs: false,
  props: {
    // ajax 防止重复提交，对应的执行方法通过 click 参数传进来，异步方法
    click: {
      type: Function as PropType<AnyFunction<Promise<void>>>,
      default: null,
    },
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    type: PropTypes.string,
    confirm: PropTypes.shape({
      title: PropTypes.string,
      onConfirm: PropTypes.func,
      onCancel: PropTypes.func,
    }),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
  },
  data() {
    return {
      ajaxing: false,
    };
  },
  computed: {
    isDisabled(): boolean {
      return this.ajaxing || this.disabled;
    },
  },
  methods: {
    async clickHandler(): Promise<void> {
      this.ajaxing = true;
      try {
        await this.click();
        await sleep(200);
      } catch (err) {}
      this.ajaxing = false;
    },
  },
  render(): JSXNode {
    const { ajaxing, isDisabled, confirm, type, round, circle, icon, loading, $attrs } = this;

    const ajaxClick = isFunction(this.click) ? { onClick: this.clickHandler } : null;
    const { $size } = useSize(this.$props);

    const wrapProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading: ajaxing || loading,
      disabled: isDisabled,
      onKeydown: (ev: KeyboardEvent): void => {
        if (ev.keyCode !== 13) return;
        ev.preventDefault();
      },
      onKeyup: (ev: KeyboardEvent): void => {
        if (ev.keyCode !== 13) return;
        this.$emit('click');
        ajaxClick && this.clickHandler();
      },
    };

    if (!confirm) {
      return <el-button {...Object.assign({}, wrapProps, $attrs, ajaxClick)}>{this.$slots.default?.()}</el-button>;
    }

    return (
      <el-popconfirm
        title={confirm.title || t('qm.button.confirmTitle')}
        onConfirm={(): void => {
          confirm.onConfirm?.();
          this.$emit('click');
          ajaxClick && this.clickHandler();
        }}
        onCancel={(): void => {
          confirm.onCancel?.();
        }}
        v-slots={{
          reference: (): JSXNode => <el-button {...wrapProps}>{this.$slots.default?.()}</el-button>,
        }}
      />
    );
  },
});
