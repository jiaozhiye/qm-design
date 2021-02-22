/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 09:02:57
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, AnyFunction } from '../../_utils/types';

import { isFunction } from 'lodash-es';
import { sleep } from '../../_utils/util';

export default defineComponent({
  name: 'QmButton',
  componentName: 'QmButton',
  props: {
    // ajax 防止重复提交，对应的执行方法通过 click 参数传进来，异步方法
    click: {
      type: Function as PropType<AnyFunction<any>>,
      default: null,
    },
    size: PropTypes.string,
    type: PropTypes.string,
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
    // 权限校验参数
    authList: PropTypes.array,
    authMark: PropTypes.string.def(''),
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
    isVisible(): boolean {
      // 没有权限控制，默认该按钮显示状态
      if (!this.authList) return true;
      return this.authList.includes(this.authMark.trim());
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
    const { ajaxing, isDisabled, size, type, round, circle, icon, $attrs } = this;
    const ajaxClick = isFunction(this.click) ? { onClick: this.clickHandler } : null;
    const wrapProps = {
      size,
      type,
      round,
      circle,
      icon,
      loading: ajaxing,
      disabled: isDisabled,
      ...$attrs,
      ...ajaxClick,
    };
    return <el-button {...wrapProps}>{this.$slots.default?.()}</el-button>;
  },
});
