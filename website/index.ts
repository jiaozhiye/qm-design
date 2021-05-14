/*
 * @Author: 焦质晔
 * @Date: 2021-02-05 09:13:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-05-14 09:42:19
 */
import { createApp } from 'vue';
import router from './router';

import DemoBlock from './components/demo-block.vue';
import RightNav from './components/right-nav.vue';
import SideNav from './components/side-nav.vue';

import 'highlight.js/styles/color-brewer.css';
import './assets/style/common.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

import App from './App.vue';

import QmDesign from '../lib/index.esm.js';
import '../lib/style/index.css';

const app = createApp(App);

app.component('DemoBlock', DemoBlock);
app.component('RightNav', RightNav);
app.component('SideNav', SideNav);

app.use(router).use(QmDesign, {
  size: 'medium',
});

app.mount('#app');
