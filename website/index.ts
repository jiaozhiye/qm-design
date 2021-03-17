/*
 * @Author: 焦质晔
 * @Date: 2021-02-05 09:13:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-17 14:36:01
 */
import { createApp } from 'vue';
import router from './router';

import DemoBlock from './components/demo-block.vue';
import RightNav from './components/right-nav.vue';

import 'highlight.js/styles/color-brewer.css';
import './assets/style/common.scss';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

import App from './App.vue';

import QmDesign from '../packages';
import '../packages/style/src/index.scss';

const app = createApp(App);

app.component('DemoBlock', DemoBlock);
app.component('RightNav', RightNav);

app.use(router).use(QmDesign, { size: 'medium' }, { closeOnPressEscape: true });

app.mount('#app');
