/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-02 10:00:46
 */
import { CSSProperties, defineComponent, PropType } from 'vue';
import addEventListener from 'add-dom-event-listener';
import classnames from 'classnames';
import { isNumber, isUndefined } from 'lodash-es';
import PropTypes from '../../_utils/vue-types';
import { AnyFunction, ComponentSize, JSXNode } from '../../_utils/types';

import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import { useSize } from '../../hooks/useSize';
import { useGlobalConfig } from '../../hooks/useGlobalConfig';
import { getPrefixCls } from '../../_utils/prefix';
import { stop } from '../../_utils/dom';
import { t } from '../../locale';

import Spin from '../../spin';

const trueNoop = (): boolean => !0;

enum DIR {
  right = 'rtl',
  left = 'ltr',
  top = 'ttb',
  bottom = 'btt',
}

export default defineComponent({
  name: 'QmDrawer',
  componentName: 'QmDrawer',
  inheritAttrs: false,
  props: {
    visible: PropTypes.bool.def(false),
    title: PropTypes.string,
    position: PropTypes.oneOf(['right', 'left', 'top', 'bottom']).def('right'),
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: '75%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: '60%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    level: PropTypes.number.def(1),
    loading: PropTypes.bool,
    showClose: PropTypes.bool.def(true),
    showHeader: PropTypes.bool.def(true),
    destroyOnClose: PropTypes.bool.def(false),
    showFullScreen: PropTypes.bool.def(true),
    closeOnClickModal: PropTypes.bool,
    closeOnPressEscape: PropTypes.bool.def(true),
    beforeClose: {
      type: Function as PropType<AnyFunction<any>>,
    },
    containerStyle: {
      type: [String, Object] as PropType<string | CSSProperties>,
    },
  },
  emits: ['update:visible', 'open', 'opened', 'close', 'closed', 'afterVisibleChange', 'viewportChange'],
  data() {
    Object.assign(this, { insideSpinCtrl: isUndefined(this.loading) });
    return {
      spinning: this.loading,
      fullscreen: false,
    };
  },
  watch: {
    loading(val: boolean): void {
      this.spinning = val;
    },
  },
  computed: {
    direction(): string {
      return DIR[this.position];
    },
    contentSize(): string {
      const size: number | string = ['right', 'left'].includes(this.position) ? this.width : this.height;
      return this.calcContentSize(!this.fullscreen ? size : '100%');
    },
  },
  deactivated() {
    this.close();
  },
  methods: {
    open(): void {
      if (this.insideSpinCtrl && (this.destroyOnClose || !this.panelOpened)) {
        this.spinning = true;
      }
      this.fullscreen = false; // 取消全屏
      this.$emit('open');
      this.$refs[`drawer`].drawerRef.classList.add('gpu');
    },
    opened(): void {
      this.panelOpened = true; // 打开过一次
      this.addStopEvent();
      this.$emit('opened');
      this.$emit('afterVisibleChange', true);
      this.$refs[`drawer`].drawerRef.classList.remove('gpu');
      if (this.insideSpinCtrl) {
        setTimeout(() => (this.spinning = false), 300);
      }
    },
    close(): void {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    closed(): void {
      this.removeStopEvent();
      this.$emit('closed');
      this.$emit('afterVisibleChange', false);
    },
    addStopEvent(): void {
      this.stopEvent = addEventListener(document.body, 'mousedown', stop);
    },
    removeStopEvent(): void {
      this.stopEvent?.remove();
    },
    handleClick(): void {
      this.fullscreen = !this.fullscreen;
      this.$emit('viewportChange', this.fullscreen ? 'fullscreen' : 'default');
    },
    beforeCloseHandle(cb: AnyFunction<void>): void {
      const beforeClose = this.beforeClose ?? trueNoop;
      const before = beforeClose();
      if ((before as Promise<void>)?.then) {
        (before as Promise<void>)
          .then(() => {
            cb();
          })
          .catch(() => {});
      } else if (before !== false) {
        cb();
      }
    },
    calcContentSize(val: number | string): string {
      const size = (Number(val) > 0 ? `${val}px` : val) as string;
      if (size === '100%') {
        return size;
      }
      return `calc(${size} - ${(Number(this.level) - 1) * 60}px)`;
    },
    renderHeader(): JSXNode {
      const { title, fullscreen, showFullScreen } = this;
      return (
        <div class="drawer-title">
          <span class="title">{title}</span>
          {showFullScreen && (
            <span title={fullscreen ? t('qm.dialog.cancelFullScreen') : t('qm.dialog.fullScreen')} class="fullscreen" onClick={this.handleClick}>
              <i class={['iconfont', fullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen']} />
            </span>
          )}
        </div>
      );
    },
    DO_CLOSE(): void {
      this.$refs[`drawer`].handleClose();
    },
  },
  render(): JSXNode {
    const { contentSize, direction, containerStyle, $props } = this;

    const { global } = useGlobalConfig();
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('drawer');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };

    const wrapProps = {
      customClass: classnames(cls),
      modelValue: $props.visible,
      direction,
      size: contentSize,
      withHeader: $props.showHeader,
      showClose: $props.showClose,
      beforeClose: this.beforeCloseHandle,
      closeOnClickModal: $props.closeOnClickModal ?? global?.closeOnClickModal ?? false,
      closeOnPressEscape: $props.closeOnPressEscape,
      destroyOnClose: $props.destroyOnClose,
      appendToBody: true,
      onOpen: this.open,
      onOpened: this.opened,
      onClose: this.close,
      onClosed: this.closed,
    };

    return (
      <el-drawer ref="drawer" {...wrapProps} v-slots={{ title: () => this.renderHeader() }}>
        <Spin spinning={this.spinning} tip="Loading..." containerStyle={{ height: '100%' }}>
          <div class="drawer-container" style={containerStyle}>
            {this.$slots.default?.()}
          </div>
        </Spin>
      </el-drawer>
    );
  },
});
