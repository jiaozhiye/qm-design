/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-22 20:23:29
 */
import { defineComponent, PropType, CSSProperties } from 'vue';
import classnames from 'classnames';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, Nullable, AnyFunction } from '../../_utils/types';

import { isNumber, isUndefined } from 'lodash-es';
import { isValidWidthUnit } from '../../_utils/validators';
import { useGlobalConfig, getParserWidth } from '../../_utils/util';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';

import Spin from '../../spin';

export default defineComponent({
  name: 'QmDialog',
  componentName: 'QmDialog',
  inheritAttrs: false,
  props: {
    visible: PropTypes.bool.def(false),
    title: PropTypes.string,
    position: PropTypes.oneOf(['right', 'left', 'top', 'bottom']).def('right'),
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
        return isNumber(val) || isValidWidthUnit(val) || 'auto' || 'none';
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
  emits: [
    'update:visible',
    'open',
    'opened',
    'close',
    'closed',
    'afterVisibleChange',
    'viewportChange',
  ],
  data() {
    this.insideSpinCtrl = isUndefined(this.loading);
    return {
      spinning: this.loading,
      fullscreen: false,
    };
  },
  computed: {
    disTop() {
      if (this.fullscreen || isNaN(Number.parseInt(this.height))) {
        return this.top;
      }
      return `calc((100vh - ${getParserWidth(this.height)}) / 2)`;
    },
    dialogHeight(): Nullable<string> {
      if (this.height === 'auto') {
        return this.fullscreen ? `100vh` : `calc(100vh - ${this.disTop} - ${this.disTop})`;
      }
      return this.height !== 'none' ? getParserWidth(this.height) : this.height;
    },
  },
  watch: {
    loading(val: boolean): void {
      this.spinning = val;
    },
    dialogHeight(): void {
      this.setDialogStyle();
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
      this.fullscreen = false; // 取消全屏
      this.$emit('open');
    },
    opened(): void {
      this.panelOpened = true; // 打开过一次
      this.$emit('opened');
      this.$emit('afterVisibleChange', true);
      if (this.insideSpinCtrl) {
        setTimeout(() => (this.spinning = false), 300);
      }
    },
    close(): void {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    closed(): void {
      this.$emit('closed');
      this.$emit('afterVisibleChange', false);
    },
    setDialogStyle(): void {
      this.$refs[`dialog`].dialogRef.style.height = this.dialogHeight;
    },
    handleClick(): void {
      this.fullscreen = !this.fullscreen;
      this.$emit('viewportChange', this.fullscreen ? 'fullscreen' : 'default');
    },
    renderHeader(): JSXNode {
      const { title, fullscreen, showFullScreen } = this;
      return (
        <div class="dialog-title">
          <span class="title">{title}</span>
          {showFullScreen && (
            <span
              title={fullscreen ? t('qm.dialog.cancelFullScreen') : t('qm.dialog.fullScreen')}
              class="fullscreen"
              onClick={this.handleClick}
            >
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

    const $DESIGN = useGlobalConfig();
    const prefixCls = getPrefixCls('dialog');

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}__flex`]: height !== 'none',
      [`${prefixCls}--medium`]: $DESIGN.size === 'medium',
      [`${prefixCls}--small`]: $DESIGN.size === 'small',
      [`${prefixCls}--mini`]: $DESIGN.size === 'mini',
    };

    const wrapProps = {
      customClass: classnames(cls),
      modelValue: $props.visible,
      top: disTop,
      // withHeader: $props.showHeader,
      showClose: $props.showClose,
      fullscreen,
      beforeClose: $props.beforeClose,
      closeOnClickModal: $props.closeOnClickModal ?? $DESIGN.global.closeOnClickModal ?? false,
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
        {/* @ts-ignore: 无法被执行的代码的错误 */}
        <Spin spinning={this.spinning} tip="Loading..." containerStyle={{ height: '100%' }}>
          <div class="dialog-container" style={{ ...containerStyle }}>
            {this.$slots.default?.()}
          </div>
        </Spin>
      </el-dialog>
    );
  },
});
