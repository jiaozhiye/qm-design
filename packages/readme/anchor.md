## API

### Anchor

| 参数       | 说明                                   | 类型                    | 默认值 |
| ---------- | -------------------------------------- | ----------------------- | ------ |
| labelWidth | lable 标签宽度，单位 px                | number \| string        | 80     |
| size       | 尺寸                                   | medium \| small \| mini | -      |
| labelList  | label 的配置列表，[配置项](#labelList) | array                   | -      |

### labelList

| 参数  | 说明                          | 类型   | 默认值 |
| ----- | ----------------------------- | ------ | ------ |
| id    | 锚点元素的 id，用于锚点的定位 | string | -      |
| label | label 标签名称                | string | -      |

### 说明

锚点组件需要有固定高度，否则不会出现滚动条，可以通过标签属性 class 或 style 设置
