## API

### Anchor

说明：formType[search] -> 筛选器; formType[default] -> 表单; formType[onlyShow] -> 只读表单

| 参数           | 说明                                                  | 类型                          | 默认值  |
| -------------- | ----------------------------------------------------- | ----------------------------- | ------- |
| formType       | 表单类型                                              | default \| search \| onlyShow | default |
| list           | 表单配置项列表，[配置项](#formItem)，必要参数         | array                         | -       |
| initialValue   | 表单初始值                                            | object                        | -       |
| size           | 尺寸                                                  | medium \| small \| mini       | -       |
| labelWidth     | label 标签宽度                                        | number \| string              | 80      |
| cols           | 每行显示的列数(被 24 整除)，不设置默认为自适应        | number                        | -       |
| uniqueKey      | 用于表单配置项的本地缓存，不能重复 - formType[search] | string                        | -       |
| defaultRows    | 收起状态默认显示的行数 - formType[search]             | number                        | 1       |
| isFieldsDefine | 是否显示列定义功能 - formType[search]                 | boolean                       | true    |
| isCollapse     | 是否显示 展开/收起 功能 - formType[search]            | boolean                       | true    |
| isSearchBtn    | 是否显示 搜索/重置 按钮 - formType[search]            | boolean                       | true    |
| isSubmitBtn    | 是否显示 保存/重置 按钮 - formType[default]           | boolean                       | false   |
| fieldsChange   | 表单配置项变化回调，必要参数 - formType[search]       | function(fields)              | -       |

### formType

| 表单类型             | 说明                   |
| -------------------- | ---------------------- |
| BREAK_SPACE          | 分隔符                 |
| INPUT                | 输入框                 |
| RANGE_INPUT          | 输入框区间             |
| INPUT_NUMBER         | 数值类型输入框         |
| RANGE_INPUT_NUMBER   | 数值类型输入框区间     |
| TREE_SELECT          | 树选择器               |
| MULTIPLE_TREE_SELECT | 树选择器，多选         |
| CASCADER             | 级联选择器             |
| MULTIPLE_CASCADER    | 级联选择器多选         |
| SELECT               | 下拉选择器             |
| MULTIPLE_SELECT      | 下拉选择器，多选       |
| SWITCH               | 开关类型               |
| RADIO                | 单选按钮               |
| CHECKBOX             | 复选框                 |
| MULTIPLE_CHECKBOX    | 复选框，多选           |
| TEXT_AREA            | 文本域                 |
| SEARCH_HELPER        | 下拉联想搜索帮助       |
| DATE                 | 日期类型               |
| RANGE_DATE           | 日期区间类型，单独选择 |
| RANGE_DATE_EL        | 日期区间类型，拖拽选择 |
| TIME                 | 时间类型               |
| RANGE_TIME           | 时间区间类型           |
| TIME_SELECT          | 时间选择               |
| RANGE_TIME_SELECT    | 时间区间选择           |
| UPLOAD_IMG           | 图片上传               |
| UPLOAD_FILE          | 附件上传               |
| TINYMCE              | 富文本编辑器           |

### formItem

| 参数         | 说明                                                          | 类型                             | 默认值 |
| ------------ | ------------------------------------------------------------- | -------------------------------- | ------ |
| type         | 字段类型，[配置项](#formType)，必要参数                       | string                           | -      |
| fieldName    | 字段数据名，不能重复，必要参数                                | string                           | -      |
| label        | label 名称，必要参数                                          | string                           | -      |
| labelWidth   | label 标签宽度                                                | number \| string                 | 80     |
| description  | label 表述信息                                                | string                           | -      |
| hidden       | 是否隐藏，不占页面空间                                        | boolean                          | -      |
| invisible    | 是否可见，占页面空间                                          | boolean                          | -      |
| disabled     | 是否禁用                                                      | boolean                          | -      |
| rules        | 校验规则，[配置项](#rules)                                    | array                            | -      |
| selfCols     | 自身占据的列数，数值 24 表示占据整行                          | number                           | 1      |
| offsetLeft   | 左侧的偏移列数                                                | number                           | -      |
| offsetRight  | 右侧的偏移列数                                                | number                           | -      |
| style        | 设置 css 样式                                                 | styleObject                      | -      |
| id           | 设置分隔符节点 id 属性，用于锚点定位                          | string                           | -      |
| options      | 表单字段的详细配置，[配置项](#options)                        | object                           | -      |
| searchHelper | 输入框类型搜索帮助的配置，[配置项](#searchHelper)             | object                           | -      |
| request      | 请求配置项，用于获取表单列表数据，[配置项](#request)          | object                           | -      |
| upload       | 附件上传的配置，[配置项](#upload)                             | object                           | -      |
| collapse     | 分隔符的 展开/收起 配置，[配置项](#collapse)                  | object                           | -      |
| labelOptions | label 标签配置，用于实现自定义 label，[配置项](#labelOptions) | object                           | -      |
| descOptions  | 描述信息配置，[配置项](#descOptions)                          | object                           | -      |
| placeholder  | 表单元素的 placeholder 原生属性                               | string                           | -      |
| clearable    | 是否显示清空按钮                                              | boolean                          | -      |
| readonly     | 是否只读                                                      | boolean                          | -      |
| noResetable  | 是否不可被重置                                                | boolean                          | -      |
| render       | 自定义表单项                                                  | function(formItem, ctx): JSXNode | -      |

### rules

| 参数      | 说明             | 类型                             | 默认值 |
| --------- | ---------------- | -------------------------------- | ------ |
| required  | 是否必填         | boolean                          | -      |
| message   | 提示信息         | string                           | -      |
| trigger   | 校验触发 fangshi | change \| blur \| [blur, change] | -      |
| min       | 最小长度         | number                           | -      |
| max       | 最大长度         | number                           | -      |
| validator | 自定义校验方法   | function(rule, value, callback)  | -      |

注意：表单控件如果使用了自定义校验规则，rules 配置中不能加 message 属性，required 的非空校验也需要在自定义的校验方法中实现

### options

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
