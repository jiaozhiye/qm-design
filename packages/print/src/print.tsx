/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-01 17:52:29
 */
import { defineComponent, PropType } from 'vue';
import PropTypes from '../../_utils/vue-types';
import { JSXNode, ComponentSize } from '../../_utils/types';

import { useSize } from '../../hooks/useSize';
import { sleep, noop, isValidElement } from '../../_utils/util';
import { t } from '../../locale';
import { isValidComponentSize } from '../../_utils/validators';

import config from './config';
import Preview from './preview';
import Dialog from '../../dialog';

export default defineComponent({
  name: 'QmPrint',
  componentName: 'QmPrint',
  inheritAttrs: false,
  props: {
    dataSource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    templateRender: PropTypes.any.isRequired,
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    uniqueKey: PropTypes.string,
    defaultConfig: PropTypes.object,
    preview: PropTypes.bool.def(true),
    closeOnPrinted: PropTypes.bool.def(false),
    type: PropTypes.string,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
    click: PropTypes.func.def(noop),
  },
  data() {
    return {
      visible: !1,
      loading: !1,
    };
  },
  methods: {
    async clickHandle(): Promise<void> {
      this.loading = !0;
      try {
        const res = await this.click();
        this.loading = !1;
        if (typeof res === 'boolean' && !res) return;
        await this.DO_PRINT();
      } catch (err) {}
      this.loading = !1;
    },
    async DO_PRINT(): Promise<void> {
      await sleep(0);
      this.visible = !0;
      await sleep(this.preview ? 500 : 0);
      const { SHOW_PREVIEW, DIRECT_PRINT } = this.$refs.preview.$refs.container;
      this.preview ? SHOW_PREVIEW() : DIRECT_PRINT();
    },
    createRender(): JSXNode {
      const { $props } = this;
      const dialogProps = {
        visible: this.visible,
        title: t('qm.print.preview'),
        width: `${config.previewWidth}px`,
        destroyOnClose: true,
        'update:visible': (val) => (this.visible = val),
        onOpen: (): void => this.$emit('open'),
        onClosed: (): void => this.$emit('close'),
      };
      const previewProps = {
        ref: 'preview',
        dataSource: $props.dataSource,
        templateRender: $props.templateRender,
        uniqueKey: $props.uniqueKey,
        defaultConfig: $props.defaultConfig,
        preview: $props.preview,
        closeOnPrinted: $props.closeOnPrinted,
        onClose: (): void => {
          this.visible = !1;
        },
      };
      return this.preview ? (
        <Dialog {...dialogProps}>
          <Preview {...previewProps} />
        </Dialog>
      ) : this.visible ? (
        <Preview {...previewProps} />
      ) : null;
    },
  },
  render(): JSXNode {
    const { loading, type = 'primary', round, circle, icon = 'el-icon-printer', disabled } = this;
    const { $size } = useSize(this.$props);
    const btnProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading,
      disabled,
      onClick: this.clickHandle,
    };
    return isValidElement(this.$slots.default?.()) ? (
      <el-button {...btnProps}>
        {this.$slots.default()}
        {this.createRender()}
      </el-button>
    ) : (
      this.createRender()
    );
  },
});
