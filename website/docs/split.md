## Split 分割面板

可拖动改变两个模块的尺寸。

### Split

:::demo

```html
<template>
  <qm-split initialValue="30%">
    <qm-split-pane>
      <div style="height: 180px; padding: 10px;">模块1</div>
    </qm-split-pane>
    <qm-split-pane>
      <div style="height: 180px; padding: 10px;">模块2</div>
    </qm-split-pane>
  </qm-split>
</template>

<script>
  export default {
    data() {
      return {};
    },
  };
</script>
```

:::

### Split 参数

| 参数         | 说明                 | 类型                   | 默认值     |
| ------------ | -------------------- | ---------------------- | ---------- |
| direction    | 排列的方向           | horizontal \| vertical | horizontal |
| initialValue | 第一个容器的默认尺寸 | string \| number       | 50%        |

### SplitPane 参数

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |

### SplitPane Slot

| 名称    | 说明     |
| ------- | -------- |
| default | 内容元素 |
