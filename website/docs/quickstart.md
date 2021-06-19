## 快速上手

:::tip
推荐使用 qm-vue-cli 脚手架，架构中已经集成了 qm-design 组件库。
:::

### 引入 Qm Design

在 main.js 中写入以下内容：

```javascript
import { createApp } from 'vue';
import QmDesign from '@jiaozhiye/qm-design';
import '@jiaozhiye/qm-design/lib/style/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(QmDesign);
app.mount('#app');
```

### 全局配置

在引入 Qm Design 时，可以传入两个参数：

- 第一个是全局配置对象，该对象目前支持 `size` 与 `zIndex` 字段。
- 第一个是全局默认参数。

```javascript
import { createApp } from 'vue';
import QmDesign from '@jiaozhiye/qm-design';
import '@jiaozhiye/qm-design/lib/style/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(
  QmDesign,
  { size: 'small', zIndex: 1000 },
  {
    print: {
      leftLogo: require('../assets/img/logo_l.png'), // 打印单左侧 Logo
      rightLogo: require('../assets/img/logo_r.png'), // 打印单右侧 Logo
    },
    tinymceScriptSrc: '/static/tinymce/tinymce.min.js', // tinymce(富文本编辑器) js 插件路径
    closeOnClickModal: true, // qm-drawer 和 qm-dialog 组件，点击遮罩层关闭
    getComponentConfigApi: () => {}, // 获取服务端配置信息的接口
    saveComponentConfigApi: () => {}, // 配置信息保存到服务端的接口
  }
);
```
