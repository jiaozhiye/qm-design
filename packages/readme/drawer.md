## API

### Drawer

| 参数               | 说明                                                                       | 类型                           | 默认值 |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------ | ------ |
| v-model:visible    | 是否显示 Drawer                                                            | boolean                        | -      |
| title              | 标题名称                                                                   | string                         | -      |
| position           | Drawer 打开的方向                                                          | right \| left \| top \| bottom | right  |
| size               | 尺寸                                                                       | medium \| small \| mini        | -      |
| width              | 宽度                                                                       | number \| string               | 65%    |
| height             | 高度                                                                       | number \| string               | 60%    |
| level              | Drawer 的层级                                                              | number                         | 1      |
| top                | 上边距                                                                     | string                         | 10vh   |
| loading            | Drawer Body 的 loading 状态，不传此参数，会默认开启 300ms 的 loading 动画  | boolean                        | -      |
| showClose          | 是否显示关闭按钮                                                           | boolean                        | true   |
| showHeader         | 是否显示 header 栏                                                         | boolean                        | true   |
| destroyOnClose     | 关闭时销毁 Drawer 中的子组件                                               | boolean                        | false  |
| showFullScreen     | 是否显示全屏按钮                                                           | boolean                        | true   |
| closeOnClickModal  | 是否可以通过点击 modal 关闭 Drawer                                         | boolean                        | false  |
| closeOnPressEscape | 是否可以通过按下 ESC 关闭 Drawer                                           | boolean                        | true   |
| containerStyle     | Drawer 内容容器的 css 样式                                                 | styleObject                    | -      |
| beforeClose        | Drawer 关闭前的回调，若返回 false 或者返回 Promise 且被 reject，则阻止关闭 | function                       | -      |

### 事件

| 事件名称           | 说明                            | 回调参数            |
| ------------------ | ------------------------------- | ------------------- |
| open               | Drawer 打开时触发               | -                   |
| opened             | Drawer 打开动画结束时触发       | -                   |
| close              | Drawer 关闭时触发               | -                   |
| closed             | Drawer 关闭动画结束时触发       | -                   |
| afterVisibleChange | Drawer 打开/关闭 动画结束时触发 | visible: boolean    |
| viewportChange     | Drawer 全屏按钮切换时触发       | fullscreen: boolean |

### 方法

| 事件名称 | 说明             | 参数 | 返回值 |
| -------- | ---------------- | ---- | ------ |
| DO_CLOSE | 关闭 Drawer 方法 | -    | -      |
