/*
 * @Author: 焦质晔
 * @Date: 2021-02-09 09:03:59
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-04-13 09:03:48
 */
import { defineComponent, PropType } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';

import PropTypes from '../../_utils/vue-types';
import { JSXNode, ComponentSize } from '../../_utils/types';
import { useSize } from '../../hooks/useSize';
import { download } from '../../_utils/download';
import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';
import { stop } from '../../_utils/dom';
import { warn } from '../../_utils/error';
import { t } from '../../locale';

import canvasCompress from './compress';
import CropperPanel from './CropperPanel.vue';
import Dialog from '../../dialog';

type IFile = {
  name: string;
  url: string;
};

export default defineComponent({
  name: 'QmUploadCropper',
  componentName: 'QmUploadCropper',
  inheritAttrs: false,
  emits: ['change', 'success', 'error'],
  props: {
    size: {
      type: String as PropType<ComponentSize>,
      validator: isValidComponentSize,
    },
    actionUrl: PropTypes.string.isRequired,
    initialValue: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
      }).loose
    ).def([]),
    remove: PropTypes.shape({
      api: PropTypes.func.isRequired,
      params: PropTypes.object,
      callback: PropTypes.func,
    }),
    isCalcHeight: PropTypes.bool.def(true),
    fixedSize: PropTypes.array.def([1.5, 1]),
    titles: PropTypes.array.def([]),
    limit: PropTypes.number.def(1),
    fileSize: PropTypes.number,
    fileTypes: PropTypes.array.def(['jpg', 'png', 'bmp']),
    headers: PropTypes.object.def({}),
    params: PropTypes.object.def({}),
    disabled: PropTypes.bool,
  },
  data() {
    Object.assign(this, {
      uploadWrap: null,
      fileData: null,
      uid: '',
      width: 146,
      dialogImageUrl: '',
    });
    return {
      file: null,
      fileList: this.initialValue,
      previewVisible: false,
      cropperVisible: false,
      isLoading: false,
    };
  },
  computed: {
    calcHeight(): number {
      const calcWidth: number = (this.width * this.fixedSize[1]) / this.fixedSize[0];
      return this.isCalcHeight && this.fixedSize.length === 2 ? Number.parseInt(calcWidth.toString()) : this.width;
    },
  },
  watch: {
    initialValue(val: Array<IFile>): void {
      this.fileList = val;
    },
    fileList(val: Array<IFile>): void {
      this.$emit('change', val);
      if (val.length === this.limit) {
        // 待测试
        this.$parent.clearValidate && this.$parent.clearValidate();
      }
    },
  },
  mounted() {
    this.uploadWrap = this.$refs[`upload`].$el.querySelector('.el-upload');
    this.setUploadWrapHeight();
  },
  updated() {
    this.$refs[`uploadCropper`]?.Update();
  },
  methods: {
    handlePreview(index: number): void {
      this.dialogImageUrl = this.fileList[index].url;
      this.previewVisible = true;
    },
    async handleRemove(index: number): Promise<void> {
      if (this.remove?.api) {
        try {
          await ElMessageBox.confirm(t('qm.button.confirmTitle'), t('qm.button.confirmPrompt'), { type: 'warning' });
          const res = await this.remove.api({ ...this.fileList[index], ...this.remove.params });
          if (res.code === 200) {
            this.fileList.splice(index, 1);
            this.remove.callback?.();
          }
        } catch (err) {}
      } else {
        this.fileList.splice(index, 1);
      }
    },
    changeHandler(file, files): void {
      if (this.uid === file.uid) return;
      this.uid = file.uid;
      this.file = file;
      if (!this.fileSize) {
        this.cropperVisible = true;
      } else {
        this.doUpload();
      }
    },
    uploadHandler(data): void {
      this.fileData = data;
      this.doUpload();
    },
    closeHandler(): void {
      this.clearFiles();
    },
    clearFiles(): void {
      this.$refs[`upload`].clearFiles();
    },
    doUpload(): void {
      this.$refs[`upload`].submit();
    },
    beforeUpload(file): boolean {
      if (!this.fileSize) {
        return true;
      }
      const isLt5M = file.size / 1024 / 1024 < this.fileSize;
      if (!isLt5M) {
        ElMessage.warning(t('qm.uploadFile.sizeLimit', { size: this.fileSize }));
      }
      return isLt5M;
    },
    async upload(options): Promise<void> {
      const { params, headers } = this.$props;
      const formData = new FormData();
      let blob: Blob = this.file.raw;
      if (this.fileData) {
        // @ts-ignore
        let base64 = await canvasCompress({
          img: this.fileData,
          type: 'jpg',
          fillColor: '#fff',
          width: 1200,
        });
        blob = this.dataURItoBlob(base64.img);
      }
      // 有的后台需要传文件名，不然会报错
      formData.append('file', blob, this.file.name);
      // 处理请求的额外参数
      for (let key in params) {
        formData.append(key, params[key]);
      }
      if (!this.actionUrl) {
        return warn('qm-upload-cropper', `配置项 actionUrl 是必要参数`);
      }
      try {
        const { data: res } = await axios.post(this.actionUrl, formData, { headers });
        if (res.code === 200) {
          this.fileList.push({ name: this.file.name, url: res.data || '' });
          this.$emit('success', res.data);
        } else {
          this.clearFiles();
          this.$message.error(res.msg);
        }
      } catch (err) {
        this.clearFiles();
        this.$emit('error', err);
        ElMessage.error(t('qm.uploadCropper.uploadError'));
      }
      this.cropperVisible = false;
      this.isLoading = false;
    },
    setUploadWrapHeight(): void {
      this.uploadWrap.style.height = `${this.calcHeight}px`;
    },
    // base64 转成 bolb 对象
    dataURItoBlob(base64Data): Blob {
      let byteString;
      if (base64Data.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(base64Data.split(',')[1]);
      } else {
        byteString = unescape(base64Data.split(',')[1]);
      }
      let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
      let ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], { type: mimeString });
    },
    async downloadHandle(index): Promise<void> {
      try {
        await this.downloadFile(this.fileList[index]);
      } catch (err) {
        ElMessage.error(t('qm.uploadCropper.downError'));
      }
    },
    // 获取服务端文件 to blob
    async downLoadByUrl(url, params = {}): Promise<Blob> {
      const res = await axios({ url, params, headers: this.headers, responseType: 'blob' });
      return res.data;
    },
    // 执行下载动作
    async downloadFile({ url, name }, params): Promise<void> {
      const blob: Blob = await this.downLoadByUrl(url, params);
      let fileName = url.slice(url.lastIndexOf('/') + 1);
      if (name) {
        let extendName = url.slice(url.lastIndexOf('.') + 1);
        fileName = `${name.slice(0, name.lastIndexOf('.') !== -1 ? name.lastIndexOf('.') : undefined)}.${extendName}`;
      }
      download(blob, fileName);
    },
    renderPictureCard(): JSXNode {
      const { disabled, calcHeight, fileList, titles } = this;
      return (
        <ul class="el-upload-list el-upload-list--picture-card">
          {fileList.map((item, index) => (
            <li key={index} class="el-upload-list__item" style={{ height: `${calcHeight}px` }} onClick={(ev: MouseEvent): void => stop(ev)}>
              <div>
                <img class="el-upload-list__item-thumbnail" src={item.url} alt="" />
                {titles[index] && <h5 class="el-upload-list__item-title">{titles[index]}</h5>}
                <span class="el-upload-list__item-actions">
                  <span class="el-upload-list__item-dot">
                    <i class="el-icon-zoom-in" onClick={() => this.handlePreview(index)} />
                  </span>
                  {!disabled && (
                    <span class="el-upload-list__item-dot">
                      <i class="el-icon-delete" onClick={() => this.handleRemove(index)} />
                    </span>
                  )}
                  <span class="el-upload-list__item-dot">
                    <i class="el-icon-download" onClick={() => this.downloadHandle(index)} />
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      );
    },
  },
  render(): JSXNode {
    const { limit, disabled, file, fixedSize, fileList, fileTypes, dialogImageUrl } = this;
    const { $size } = useSize(this.$props);
    const prefixCls = getPrefixCls('upload-cropper');
    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: $size === 'medium',
      [`${prefixCls}--small`]: $size === 'small',
      [`${prefixCls}--mini`]: $size === 'mini',
    };
    const uploadProps = {
      action: '#',
      listType: 'picture-card',
      accept: 'image/jpg, image/jpeg, image/png, image/bmp',
      limit,
      drag: true,
      multiple: false,
      autoUpload: false,
      showFileList: false,
      disabled,
      style: { display: fileList.length !== limit ? 'block' : 'none' },
      httpRequest: this.upload,
      beforeUpload: this.beforeUpload,
      onChange: this.changeHandler,
    };
    const previewDialogProps = {
      visible: this.previewVisible,
      title: t('qm.uploadCropper.preview'),
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.previewVisible = val;
      },
    };
    const cropperDialogProps = {
      visible: this.cropperVisible,
      title: t('qm.uploadCropper.cropper'),
      width: '830px',
      destroyOnClose: true,
      'onUpdate:visible': (val: boolean): void => {
        this.cropperVisible = val;
      },
      onClosed: this.closeHandler,
    };
    const cropperProps = {
      imgFile: file,
      fixedNumber: fixedSize,
      loading: this.isLoading,
      'onUpdate:loading': (val: boolean): void => {
        this.isLoading = val;
      },
      onUpload: this.uploadHandler,
    };
    return (
      <div class={cls}>
        {this.renderPictureCard()}
        <el-upload
          ref="upload"
          class={cls}
          {...uploadProps}
          v-slots={{
            default: (): JSXNode => (
              <>
                <i class="el-icon-upload" />
                <div class="el-upload__text">
                  {t('qm.uploadCropper.dragableText')} <em>{t('qm.upload.text')}</em>
                </div>
              </>
            ),
            tip: (): JSXNode => <div class="el-upload__tip">{t('qm.uploadCropper.tooltip', { type: fileTypes.join(',') })}</div>,
          }}
        />
        <Dialog {...previewDialogProps}>
          <div class={`${prefixCls}__peview`}>
            <img src={dialogImageUrl} alt="" />
          </div>
        </Dialog>
        <Dialog {...cropperDialogProps}>
          <CropperPanel ref="uploadCropper" {...cropperProps} />
        </Dialog>
      </div>
    );
  },
});
