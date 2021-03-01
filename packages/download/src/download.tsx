/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-01 10:32:03
 */
import { defineComponent, PropType } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

import PropTypes from '../../_utils/vue-types';
import { JSXNode, ComponentSize } from '../../_utils/types';
import { useSize } from '../../hooks/useSize';
import { download } from '../../_utils/download';
import { isValidComponentSize } from '../../_utils/validators';
import { t } from '../../locale';

export default defineComponent({
  name: 'QmDownload',
  componentName: 'QmDownload',
  inheritAttrs: false,
  emits: ['success', 'error'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    actionUrl: PropTypes.string,
    fileName: PropTypes.string,
    actionUrlFetch: PropTypes.shape({
      api: PropTypes.func.isRequired, // api 接口
      params: PropTypes.object, // 接口参数
    }),
    headers: PropTypes.object.def({}),
    params: PropTypes.object.def({}),
    type: PropTypes.string,
    disabled: PropTypes.bool,
    round: PropTypes.bool,
    circle: PropTypes.bool,
    icon: PropTypes.string,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async clickHandle(): Promise<void> {
      this.loading = true;
      try {
        let actionUrl = this.actionUrl;
        if (this.actionUrlFetch?.api) {
          const res = await this.actionUrlFetch.api(this.actionUrlFetch.params);
          if (res.code === 200) {
            actionUrl = res.data?.url || res.data?.vUrl;
          }
        }
        if (actionUrl) {
          await this.downloadFile(actionUrl, this.params);
          this.$emit('success');
        }
      } catch (err) {
        this.$emit('error', err);
        ElMessage.error(t('qm.download.error'));
      }
      this.loading = false;
    },
    // 获取服务端文件 to blob
    async downLoadByUrl(url, params = {}): Promise<unknown> {
      return await axios({ url, params, headers: this.headers, responseType: 'blob' });
    },
    // 执行下载动作
    async downloadFile(url, params): Promise<void> {
      const res = await this.downLoadByUrl(url, params);
      const blob: Blob = res.data;
      const contentDisposition = res.headers['content-disposition'];
      const fileName = this.fileName
        ? this.fileName
        : contentDisposition
        ? contentDisposition.split(';')[1].split('filename=')[1]
        : url.slice(url.lastIndexOf('/') + 1);
      download(blob, fileName);
    },
  },
  render(): JSXNode {
    const { loading, type = 'primary', round, circle, icon = 'el-icon-download', disabled } = this;
    const { $size } = useSize(this.$props);
    const wrapProps = {
      size: $size,
      type,
      round,
      circle,
      icon,
      loading,
      disabled,
      onClick: this.clickHandle,
    };
    return <el-button {...wrapProps}>{this.$slots.default?.()}</el-button>;
  },
});
