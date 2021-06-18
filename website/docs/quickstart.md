## 快速上手

本节将介绍如何在项目中使用 `qm-design`。

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
