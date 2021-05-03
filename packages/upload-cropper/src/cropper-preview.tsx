/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-03 19:31:56
 */
import { defineComponent, CSSProperties } from 'vue';
import { JSXNode } from '../../_utils/types';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';

import Cropper from '../../cropper';

const PREVIEW_WIDTH: number = 400;

enum TYPE {
  jpg = 'image/jpeg',
  jpeg = 'image/jpeg',
  png = 'image/png',
}

export default defineComponent({
  name: 'CropperPreview',
  props: ['imgFile', 'fixedNumber', 'loading'],
  emits: ['upload', 'close'],
  computed: {
    previewSize(): CSSProperties {
      const [w, h] = this.fixedNumber;
      return {
        width: `${PREVIEW_WIDTH}px`,
        height: `calc(${PREVIEW_WIDTH}px * ${h / w || 1})`,
      };
    },
    fileType(): string {
      const { name } = this.imgFile;
      return name.slice(name.lastIndexOf('.') + 1).toLocaleLowerCase();
    },
  },
  methods: {
    scaleHandle(percent: number): void {
      this.$refs[`cropper`].relativeZoom(percent);
    },
    rotateHandle(deg: number): void {
      this.$refs[`cropper`].rotate(deg);
    },
    confirmHandle(): void {
      this.$refs[`cropper`]
        .getCroppedCanvas({
          maxWidth: 1920,
          fillColor: this.fileType === 'png' ? 'transparent' : '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        })
        .toBlob((blob: Blob): void => {
          this.$emit('upload', blob);
        }, TYPE[this.fileType]);
    },
    cancelHandle(): void {
      this.$emit('close', false);
    },
  },
  render(): JSXNode {
    const { imgFile, previewSize, fixedNumber, loading } = this;
    const [w, h] = fixedNumber;
    const prefixCls = getPrefixCls('cropper-preview');
    const cls = {
      [prefixCls]: true,
    };
    return (
      <div>
        <div class={cls}>
          <div class="cropper-area">
            <div class="img-cropper">
              <Cropper ref="cropper" aspect-ratio={w / h} src={imgFile.url} drag-mode="move" preview=".preview" />
            </div>
            <div class="actions">
              <el-button type="primary" icon="el-icon-zoom-in" onClick={() => this.scaleHandle(0.2)}>
                {t('qm.uploadCropper.zoomIn')}
              </el-button>
              <el-button type="primary" icon="el-icon-zoom-out" onClick={() => this.scaleHandle(-0.2)}>
                {t('qm.uploadCropper.zoomOut')}
              </el-button>
              <el-button type="primary" icon="el-icon-refresh-right" onClick={() => this.rotateHandle(90)}>
                {t('qm.uploadCropper.rotatePlus')}
              </el-button>
              <el-button type="primary" icon="el-icon-refresh-left" onClick={() => this.rotateHandle(-90)}>
                {t('qm.uploadCropper.rotateSubtract')}
              </el-button>
            </div>
          </div>
          <div class="preview-area">
            <div class="preview" style={previewSize} />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9,
            borderTop: '1px solid #d9d9d9',
            padding: '10px 15px',
            background: '#fff',
            textAlign: 'right',
          }}
        >
          <el-button onClick={() => this.cancelHandle()}>{t('qm.dialog.close')}</el-button>
          <el-button type="primary" icon="el-icon-upload" loading={loading} onClick={() => this.confirmHandle()}>
            {t('qm.uploadCropper.text')}
          </el-button>
        </div>
      </div>
    );
  },
});
