/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-07 13:09:51
 */
import { defineComponent, PropType } from 'vue';
import { JSXNode } from '../../_utils/types';
import { t } from '../../locale';

import Dialog from '../../dialog';
import UploadCropper from '../../upload-cropper';

export default defineComponent({
  name: 'QmUploadImg',
  emits: ['success'],
  props: ['actionUrl', 'headers', 'fixedSize', 'onSuccess'],
  data() {
    return {
      visible: false,
      fileList: [],
    };
  },
  methods: {
    handleSubmit(): void {
      this.$emit('success', this.fileList);
      this.visible = false;
    },
    handleSuccess(val): void {
      this.fileList = val;
    },
  },
  render(): JSXNode {
    const { visible, actionUrl, headers = {}, fixedSize } = this;
    const wrapProps = {
      visible,
      title: t('qm.uploadCropper.text'),
      loading: false,
      showFullScreen: false,
      destroyOnClose: true,
      containerStyle: { paddingBottom: '52px' },
      'onUpdate:visible': (val) => {
        this.visible = val;
      },
    };
    return (
      <>
        <el-button
          class="editor-upload-btn"
          icon="el-icon-upload"
          size="mini"
          type="primary"
          onClick={() => {
            this.visible = true;
          }}
        >
          {t('qm.uploadCropper.text')}
        </el-button>
        <Dialog {...wrapProps}>
          {/* @ts-ignore */}
          <UploadCropper action-url={actionUrl} headers={headers} fixed-size={fixedSize} limit={20} is-calc-height onChange={this.handleSuccess} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              right: 0,
              zIndex: 9,
              borderTop: '1px solid #e9e9e9',
              padding: '10px 15px',
              background: '#fff',
              textAlign: 'right',
            }}
          >
            <el-button type="primary" onClick={this.handleSubmit}>
              {t('qm.dialog.close')}
            </el-button>
            <el-button onClick={() => (this.visible = !1)}>{t('qm.dialog.confirm')}</el-button>
          </div>
        </Dialog>
      </>
    );
  },
});
