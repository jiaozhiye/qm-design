/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 16:39:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-11 11:05:32
 */
import type { App } from 'vue';
import { ComponentSize, AnyObject } from './_utils/types';

import QmButton from './button';
import QmSpace from './space';
import QmAnchor from './anchor';
import QmAnchorItem from './anchor-item';
import QmDivider from './divider';
import QmSpin from './spin';
import QmDrawer from './drawer';
import QmDialog from './dialog';
import QmTabs from './tabs';
import QmTabPane from './tab-pane';
import QmForm from './form';
import QmDownload from './download';
import QmUpload from './upload';
import QmUploadCropper from './upload-cropper';
import QmPrint from './print';
import QmPrintGroup from './print-group';
import QmPrintItem from './print-item';
import QmTinymce from './tinymce';
import QmSplit from './split';
import QmSplitPane from './split-pane';
import QmCountup from './countup';
import QmTable from './table';
import QmSearchHelper from './search-helper';

import { use as locale, i18n } from './locale';
import { version } from './version';
import type { InstallOptions } from './_utils/config';
import { setConfig } from './_utils/config';

// import ElementPlus
import ElementPlus from 'element-plus';
import lang from 'element-plus/lib/locale/lang/zh-cn';
import 'dayjs/locale/zh-cn';
// import './style/element-variables.scss';

// 默认参数
const defaultInstallOpt: InstallOptions = {
  size: '' as ComponentSize,
  zIndex: 1000,
};

// 组件列表
const components = [
  QmButton,
  QmSpace,
  QmAnchor,
  QmAnchorItem,
  QmDivider,
  QmSpin,
  QmDrawer,
  QmDialog,
  QmTabs,
  QmTabPane,
  QmForm,
  QmDownload,
  QmUpload,
  QmUploadCropper,
  QmPrint,
  QmPrintGroup,
  QmPrintItem,
  QmTinymce,
  QmSplit,
  QmSplitPane,
  QmCountup,
  QmTable,
  QmSearchHelper,
];

const install = (app: App, opt: InstallOptions, global: AnyObject<unknown> = {}): void => {
  // use ElementPlus
  app.use(ElementPlus, Object.assign({}, { locale: lang }, defaultInstallOpt, opt));

  // use QmDesign
  const option = Object.assign({}, defaultInstallOpt, opt, { global });
  locale(option.locale);
  if (option.i18n) {
    i18n(option.i18n);
  }
  app.config.globalProperties.$DESIGN = option;
  setConfig(option);
  components.forEach((component) => {
    app.component(component.name, component);
  });
};

export {
  QmButton,
  QmSpace,
  QmAnchor,
  QmAnchorItem,
  QmDivider,
  QmSpin,
  QmDrawer,
  QmDialog,
  QmTabs,
  QmTabPane,
  QmForm,
  QmDownload,
  QmUpload,
  QmUploadCropper,
  QmPrint,
  QmPrintGroup,
  QmPrintItem,
  QmTinymce,
  QmSplit,
  QmSplitPane,
  QmCountup,
  QmTable,
  QmSearchHelper,
  version,
  install,
  locale,
};

export default {
  version,
  install,
};
