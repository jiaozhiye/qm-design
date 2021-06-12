/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 15:29:06
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import addEventListener from 'add-dom-event-listener';
import classnames from 'classnames';
import { isNumber, isUndefined } from 'lodash-es';
import { setStyle } from '../../_utils/dom';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, AnyFunction, ComponentSize } from '../../_utils/types';

import { isValidComponentSize, isValidWidthUnit } from '../../_utils/validators';
import { useSize } from '../../hooks/useSize';
import { useGlobalConfig } from '../../hooks/useGlobalConfig';
import { getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { stop } from '../../_utils/dom';
import { t } from '../../locale';
import Draggable from './draggable';
import Spin from '../../spin';

const trueNoop = (): boolean => !0;

export default defineComponent({
  name: 'QmDialog',
  componentName: 'QmDialog',
  inheritAttrs: false,
  directives: { Draggable },
  props: {
    visible: PropTypes.bool.def(false),
    title: PropTypes.string,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    width: {
      type: [Number, String] as PropType<number | string>,
      default: '65%',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val);
      },
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: 'auto',
      validator: (val: string | number): boolean => {
        return isNumber(val) || isValidWidthUnit(val) || val === 'auto' || val === 'none';
      },
    },
    top: {
      type: String,
      default: '10vh',
      validator: (val: string): boolean => {
        return isValidWidthUnit(val);
      },
    },
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
  computed: {
    $$dialog() {
      return this.$refs[`dialog`].dialogRef;
    },
    disTop(): string {
      if (this.height === 'auto' || this.height === 'none') {
        return this.top;
      }
      return this.fullscreen ? '0px' : `calc((100vh - ${getParserWidth(this.height)}) / 2)`;
    },
  },
  watch: {
    loading(val: boolean): void {
      this.spinning = val;
    },
  },
  mounted() {
    this.setDialogStyle();
  },
  deactivated() {
    this.close();
  },
  methods: {
    open(): void {
      if (this.insideSpinCtrl && (this.destroyOnClose || !this.panelOpened)) {
        this.spinning = true;
      }
      this.fullscreen = false;
      // 设置 dialog body 高度
      this.setDialogBodyStyle();
      this.$emit('open');
    },
    opened(): void {
      // 打开过一次
      this.panelOpened = true;
      this.addStopEvent();
      this.$emit('opened');
      this.$emit('afterVisibleChange', true);
      if (this.insideSpinCtrl) {
        setTimeout(() => (this.spinning = false), 200);
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
      // 恢复默认弹出位置
      this.resetDialogPosition();
    },
    setDialogStyle(): void {
      if (this.height === 'auto' || this.height === 'none') return;
      setStyle(this.$$dialog, { height: this.fullscreen ? 'auto' : getParserWidth(this.height) });
    },
    setDialogBodyStyle(): void {
      this.$nextTick(() => {
        const maxHeight: string =
          this.height !== 'auto' || this.fullscreen
            ? 'none'
            : `calc(100vh - ${this.disTop} * 2 - ${this.$$dialog.querySelector('.el-dialog__header').offsetHeight}px)`;
        setStyle(this.$$dialog.querySelector('.el-dialog__body'), { maxHeight });
      });
    },
    resetDialogPosition(): void {
      setStyle(this.$$dialog, { marginTop: this.disTop, marginLeft: 'auto', marginRight: 'auto' });
    },
    addStopEvent(): void {
      this.stopEvent = addEventListener(document.body, 'mousedown', stop);
    },
    removeStopEvent(): void {
      this.stopEvent?.remove();
    },
    handleClick(): void {
      this.fullscreen = !this.fullscreen;
      this.resetDialogPosition();
      this.setDialogStyle();
      this.setDialogBodyStyle();
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
    renderHeader(): JSXNode {
      const { title, fullscreen, showFullScreen } = this;
      return (
        <div class="dialog-title" v-draggable>
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
      this.$refs[`dialog`].handleClose();
    },
  },
  render(): JSXNode {
    const { fullscreen, disTop, height, containerStyle, $props } = this;

    const { global } = useGlobalConfig();
    const prefixCls = getPrefixCls('dialog');
    const { $size } = useSize(this.$props);

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}__flex`]: height !== 'none',
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };

    const wrapProps = {
      customClass: classnames(cls),
      modelValue: $props.visible,
      width: $props.width,
      top: disTop,
      // withHeader: $props.showHeader,
      showClose: $props.showClose,
      fullscreen,
      beforeClose: this.beforeCloseHandle,
      closeOnClickModal: $props.closeOnClickModal ?? global?.closeOnClickModal ?? false,
      closeOnPressEscape: $props.closeOnPressEscape,
      destroyOnClose: $props.destroyOnClose,
      lockScroll: true,
      appendToBody: true,
      onOpen: this.open,
      onOpened: this.opened,
      onClose: this.close,
      onClosed: this.closed,
    };
    return (
      <el-dialog ref="dialog" {...wrapProps} v-slots={{ title: () => this.renderHeader() }}>
        {/* @ts-ignore */}
        <Spin spinning={this.spinning} tip="Loading..." containerStyle={{ height: '100%' }}>
          <div class="dialog-container" style={containerStyle}>
            {this.$slots.default?.()}
          </div>
        </Spin>
      </el-dialog>
    );
  },
});
