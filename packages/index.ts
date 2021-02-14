/*
 * @Author: 焦质晔
 * @Date: 2021-02-08 16:39:21
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-14 14:28:49
 */
import type { App } from 'vue';
import { ComponentSize } from './_utils/types';

import QmButton from './button';

import { use as locale, i18n } from './locale';
import { version } from './version';
import type { InstallOptions } from './_utils/config';
import { setConfig } from './_utils/config';

// import ElementPlus
import ElementPlus from 'element-plus';
import lang from 'element-plus/lib/locale/lang/zh-cn';
// import './style/element-variables.scss';

// 默认参数
const defaultInstallOpt: InstallOptions = {
  size: '' as ComponentSize,
  zIndex: 1000,
};

// 组件列表
const components = [QmButton];

const install = (app: App, opt: InstallOptions): void => {
  // use ElementPlus
  app.use(ElementPlus, {
    locale: lang,
  });

  // use QmDesign
  const option = Object.assign(defaultInstallOpt, opt);
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

export { QmButton, version, install, locale };

export default {
  version,
  install,
};
