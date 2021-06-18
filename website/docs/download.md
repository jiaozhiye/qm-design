## Download 附件上传

用于附件下载。

### Download

:::demo

```html
<template>
  <div>暂无...</div>
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

### 参数

| 参数           | 说明                                          | 类型                                                    | 默认值  |
| -------------- | --------------------------------------------- | ------------------------------------------------------- | ------- |
| actionUrl      | 下载地址                                      | string                                                  | -       |
| fileName       | 文件名                                        | string                                                  | -       |
| size           | 按钮的尺寸                                    | medium \| small \| mini                                 | -       |
| headers        | 下载请求的 header 头信息                      | object                                                  | -       |
| params         | 下载请求的额外参数                            | object                                                  | -       |
| actionUrlFetch | 下载地址的获取接口，[配置项](#actionUrlFetch) | object                                                  | -       |
| type           | 按钮的类型                                    | primary \| success \| warning \| danger \| info \| text | primary |
| disabled       | 是否禁用状态                                  | boolean                                                 | false   |
| round          | 是否圆角按钮                                  | boolean                                                 | false   |
| circle         | 是否圆形按钮                                  | boolean                                                 | false   |
| icon           | 按钮图标类名                                  | string                                                  | -       |

### actionUrlFetch

| 参数   | 说明               | 类型           | 默认值 |
| ------ | ------------------ | -------------- | ------ |
| api    | 接口地址，必要参数 | async function | -      |
| params | 接口默认参数       | object         | -      |

### 事件

| 事件名称 | 说明           | 回调参数 |
| -------- | -------------- | -------- |
| success  | 下载完成后触发 | -        |
| error    | 下载失败时触发 | error    |
