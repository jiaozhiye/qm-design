## Dialog 弹出框

弹出对话框，可实现页面的 **二、三级交互** 功能。

### 弹出框

:::demo

```html
<template>
  <qm-button type="primary" @click="clickHandle">打开对话框</qm-button>
  <qm-dialog v-model:visible="visible" title="标题名称" destroyOnClose>
    <div>
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
    </div>
  </qm-dialog>
</template>

<script>
  export default {
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      clickHandle() {
        this.visible = true;
      },
    },
  };
</script>
```

:::

### 弹出框，内嵌表单

:::demo 底部固定按钮列表

```html
<template>
  <qm-button type="primary" @click="clickHandle">打开对话框</qm-button>
  <qm-dialog v-model:visible="visible" title="标题名称" destroyOnClose :containerStyle="{ paddingBottom: '60px' }">
    <div>
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
      内容<br />
    </div>
    <div class="fixed-footer">
      <el-button>取 消</el-button>
      <qm-button type="primary">提 交</qm-button>
    </div>
  </qm-dialog>
</template>

<script>
  export default {
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      clickHandle() {
        this.visible = true;
      },
    },
  };
</script>
```

:::

### 参数

| 参数               | 说明                                                                       | 类型                             | 默认值 |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------- | ------ |
| v-model:visible    | 是否显示 Dialog                                                            | boolean                          | -      |
| title              | 标题名称                                                                   | string                           | -      |
| size               | 尺寸                                                                       | medium \| small \| mini          | -      |
| width              | 宽度                                                                       | number \| string                 | 65%    |
| height             | 高度                                                                       | number \| string \| auto \| none | auto   |
| top                | 上边距                                                                     | string                           | 10vh   |
| loading            | Dialog Body 的 loading 状态，不传此参数，会默认开启 200ms 的 loading 动画  | boolean                          | -      |
| showClose          | 是否显示关闭按钮                                                           | boolean                          | true   |
| showHeader         | 是否显示 header 栏                                                         | boolean                          | true   |
| destroyOnClose     | 关闭时销毁 Dialog 中的子组件                                               | boolean                          | false  |
| showFullScreen     | 是否显示全屏按钮                                                           | boolean                          | true   |
| closeOnClickModal  | 是否可以通过点击 modal 关闭 Dialog                                         | boolean                          | false  |
| closeOnPressEscape | 是否可以通过按下 ESC 关闭 Dialog                                           | boolean                          | true   |
| containerStyle     | Dialog 内容容器的 css 样式                                                 | styleObject                      | -      |
| beforeClose        | Dialog 关闭前的回调，若返回 false 或者返回 Promise 且被 reject，则阻止关闭 | function                         | -      |

### 事件

| 事件名称           | 说明                            | 回调参数            |
| ------------------ | ------------------------------- | ------------------- |
| open               | Dialog 打开时触发               | -                   |
| opened             | Dialog 打开动画结束时触发       | -                   |
| close              | Dialog 关闭时触发               | -                   |
| closed             | Dialog 关闭动画结束时触发       | -                   |
| afterVisibleChange | Dialog 打开/关闭 动画结束时触发 | visible: boolean    |
| viewportChange     | Dialog 全屏按钮切换时触发       | fullscreen: boolean |

### 方法

| 事件名称 | 说明             | 参数 | 返回值 |
| -------- | ---------------- | ---- | ------ |
| DO_CLOSE | 关闭 Dialog 方法 | -    | -      |

### Dialog Slot

| 名称    | 说明        |
| ------- | ----------- |
| default | Dialog 内容 |
