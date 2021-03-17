/*
 * @Author: 焦质晔
 * @Date: 2021-02-05 09:13:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-17 12:19:08
 */
import { createApp } from 'vue';
import App from './App.vue';

import QmDesign from '../packages';
import '../packages/style/src/index.scss';

const app = createApp(App);
app.use(QmDesign, { size: 'medium' }, { closeOnPressEscape: true });

app.mount('#app');
