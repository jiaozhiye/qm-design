## API

### Table

| 参数             | 说明                                                          | 类型                                                   | 默认值 |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| columns          | 表格列的配置，[配置项](#column)，必要参数                     | array                                                  | -      |
| columnsChange    | 表格列变化事件，必要参数                                      | function(columns)                                      | -      |
| dataSource       | 数据数组                                                      | array                                                  | -      |
| rowKey           | 表格行 key 的取值，可以是字符串或一个函数                     | string \| function(row, index): string                 | uid    |
| fetch            | 向后台请求数据的接口，[配置项](#fetch)                        | object                                                 | -      |
| border           | 是否带有纵向边框                                              | boolean                                                | true   |
| height           | 表格的高度，单位 px                                           | number \| auto                                         | -      |
| minHeight        | 表格的最小高度，单位 px                                       | number                                                 | 150    |
| maxHeight        | 表格的最大高度，单位 px                                       | number                                                 | -      |
| loading          | 页面是否加载中                                                | boolean                                                | false  |
| resizable        | 所有列是否允许拖动列宽调整大小                                | boolean                                                | true   |
| size             | 表格尺寸                                                      | medium \| small \| mini                                | -      |
| uniqueKey        | 设置表格各种配置信息的本地缓存，不能重复                      | string                                                 | -      |
| showHeader       | 是否显示表头                                                  | boolean                                                | true   |
| ellipsis         | 设置所有内容过长时显示为省略号                                | boolean                                                | true   |
| rowStyle         | 给行附加样式                                                  | object \| function(row, rowIndex)                      | -      |
| cellStyle        | 给单元格附加样式                                              | object \| function(row, column, rowIndex, columnIndex) | -      |
| spanMethod       | 合并行或列的计算方法                                          | function({row, column, rowIndex, columnIndex})         | -      |
| rowDraggable     | 是否开启列表数据拖拽排序                                      | boolean                                                | false  |
| rowSelection     | 列表项是否可选择，[配置项](#rowSelection)                     | object                                                 | -      |
| rowHighlight     | 列表行高亮选中，[配置项](#rowHighlight)                       | object                                                 | -      |
| expandable       | 展开行配置项，[配置项](#expandable)                           | object                                                 | -      |
| treeStructure    | 树结构选项，[配置项](#treeStructure)                          | object                                                 | -      |
| multipleSort     | 是否为多列排序模式                                            | boolean                                                | true   |
| paginationConfig | 分页参数的详细配置，[配置项](#pagination)                     | object                                                 | -      |
| webPagination    | 是否为前端内存分页                                            | boolean                                                | false  |
| showAlert        | 是否显示表格信息                                              | boolean                                                | true   |
| topSpaceAlign    | 顶部按钮插槽的对其方式                                        | left \| right                                          | right  |
| showFullScreen   | 是否显示全屏按钮                                              | boolean                                                | true   |
| showRefresh      | 是否显示刷新按钮                                              | boolean                                                | true   |
| exportExcel      | 导出表格数据，[配置项](#exportExcel)                          | object                                                 | -      |
| tablePrint       | 表格打印，[配置项](#tablePrint)                               | object                                                 | -      |
| showSuperSearch  | 是否显示高级检索                                              | boolean                                                | true   |
| showGroupSummary | 是否显示分组汇总                                              | boolean                                                | true   |
| showColumnDefine | 是否显示列定义                                                | boolean                                                | true   |
| beforeLoadTable  | 数据渲染之前的拦截器，异步函数，返回 false 会终止表格数据渲染 | function(dataList): boolean                            | -      |

### 事件

| 事件名称    | 说明                           | 回调参数                                                                                             |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| change      | 分页、排序、筛选变化时触发     | function(pagination, filters, sorter, { currentDataSource: tableData, allDataSource: allTableData }) |
| dataChange  | 表格数据变化时触发             | function(tableData)                                                                                  |
| dataLoaded  | 表格数据加载之后触发           | function(tableData)                                                                                  |
| rowClick    | 行单击事件                     | function(row, column, event)                                                                         |
| rowDblclick | 行双击事件                     | function(row, column, event)                                                                         |
| rowEnter    | 行选中(单选)或行高亮的回车事件 | function(row, event)                                                                                 |

### 方法

| 方法名称            | 说明                                           | 参数                              | 返回值 |
| ------------------- | ---------------------------------------------- | --------------------------------- | ------ |
| CALCULATE_HEIGHT    | 计算表格高度                                   | -                                 | -      |
| DO_REFRESH          | 刷新表格数据，同时会清空列选中状态             | function(callback)                | -      |
| GET_LOG             | 获取操作记录，非空校验、格式校验、数据操作记录 | -                                 | object |
| GET_FETCH_PARAMS    | 获取表格的查询参数                             | -                                 | object |
| CLEAR_TABLE_DATA    | 清空表格数据                                   | -                                 | -      |
| CLEAR_LOG           | 清空表格操作记录                               | -                                 | -      |
| SCROLL_TO_RECORD    | 滚动到指定数据行                               | function(rowKey)                  | -      |
| SCROLL_TO_COLUMN    | 滚动到指定表格列                               | function(dataIndex)               | -      |
| SELECT_FIRST_RECORD | 选中表格首行，只针对单选类型有效               | -                                 | -      |
| CLEAR_TABLE_FOCUS   | 清空表格焦点                                   | -                                 | -      |
| INSERT_RECORDS      | 插入表格行数据                                 | function(rows \| row)             | -      |
| REMOVE_RECORDS      | 移除表格数据                                   | function(rowKeys \| rows \| row ) | -      |
| FORM_VALIDATE       | 表格中的表单校验                               | -                                 | object |

### column

| 参数         | 说明                                           | 类型                                                               | 默认值 |
| ------------ | ---------------------------------------------- | ------------------------------------------------------------------ | ------ |
| dataIndex    | 数据的 key，支持 `a.b.c` 的路径写法，必要参数  | string                                                             | -      |
| title        | 列头显示文字，必要参数                         | string                                                             | -      |
| description  | 列描述信息                                     | string                                                             | -      |
| width        | 列宽度/最小宽度                                | number                                                             | -      |
| fixed        | 列固定（IE 下无效）                            | left \| right                                                      | -      |
| align        | 设置列的对齐方式                               | left \| center \| right                                            | left   |
| theadAlign   | 设置表头的对齐方式                             | left \| center \| right                                            | left   |
| hidden       | 是否隐藏列                                     | boolean                                                            | false  |
| ellipsis     | 超过宽度将自动省略                             | boolean                                                            | false  |
| className    | 列样式类名                                     | string                                                             | -      |
| children     | 内嵌 children，以渲染分组表头                  | array                                                              |        |
| sorter       | 列排序                                         | boolean \| func                                                    | -      |
| filter       | 列筛选，[配置项](#filter)                      | object                                                             | -      |
| precision    | 数值类型字段的精度                             | number                                                             | -      |
| formatType   | 字段的格式化类型，[配置项](#formatType)        | string                                                             | -      |
| required     | 可编辑列是否必填                               | boolean                                                            | false  |
| editRender   | 可编辑单元格，返回值请参考 [配置项](#editable) | function(row, column):object                                       | -      |
| dictItems    | 数据字典配置，[配置项](#item)                  | array                                                              | -      |
| summation    | 底部合计，[配置项](#summation)                 | object                                                             | -      |
| groupSummary | 分组汇总，[配置项](#groupSummary)              | object \| boolean                                                  | false  |
| render       | 列渲染方法                                     | function(text, row, column, rowIndex, cellIndex): JSX Node         | -      |
| extraRender  | 额外的列渲染方法，用于处理导出和打印数据       | function(text, row, column, rowIndex, cellIndex): string \| number | -      |

### fetch

| 参数        | 说明                                                     | 类型                      | 默认值 |
| ----------- | -------------------------------------------------------- | ------------------------- | ------ |
| api         | ajax 接口，必要参数                                      | func                      | -      |
| params      | 接口参数，必要参数                                       | object                    | -      |
| xhrAbort    | 是否取消请求                                             | boolean                   | false  |
| stopToFirst | 是否阻止返回第一页                                       | boolean                   | false  |
| beforeFetch | 执行查询接口的前置钩子，返回 true 执行查询、false 不执行 | function(params): boolean | -      |
| dataKey     | 数据的 key，支持 `a.b.c` 的路径写法                      | string                    | items  |
| callback    | 请求的回调，参数是服务端返回的数据                       | function(response)        | -      |

### filter

| 参数  | 说明                                        | 类型   | 默认值 |
| ----- | ------------------------------------------- | ------ | ------ |
| type  | 列筛选类型，[配置项](#filterType)，必要参数 | string | -      |
| items | 筛选列表项，[配置项](#item)                 | array  | -      |

### filterType

| 参数     | 说明                       |
| -------- | -------------------------- |
| text     | 文本输入框                 |
| textarea | 文本域，多条件用 逗号 隔开 |
| checkbox | 复选框                     |
| radio    | 单选按钮                   |
| number   | 数值输入框                 |
| date     | 日期类型                   |

### editable

| 参数     | 说明                                          | 类型                            | 默认值 |
| -------- | --------------------------------------------- | ------------------------------- | ------ |
| type     | 可编辑类型，[配置项](#editType)，必要参数     | string                          | -      |
| items    | 下拉框的列表项，[配置项](#item)               | array                           | -      |
| editable | 是否可编辑                                    | boolean                         | -      |
| disabled | 是否禁用编辑功能，且禁止切换                  | boolean                         | -      |
| extra    | 可编辑表单的额外配置项，[配置项](#extra)      | object                          | -      |
| helper   | 可编辑单元格搜索帮助配置项，[配置项](#helper) | object                          | -      |
| rules    | 表单校验规则，数组值请参考[配置项](#rule)     | array                           | -      |
| onInput  | 表单的 input 事件                             | function(cell, row)             | -      |
| onChange | 表单的 change 事件                            | function(cell, row)             | -      |
| onEnter  | 表单的 enter 事件                             | function(cell, row)             | -      |
| onClick  | 搜索帮助的单击事件，只对 search-helper 有效   | Function，[参数列表](#shParams) | -      |

### editType

| 参数            | 说明          |
| --------------- | ------------- |
| text            | 文本输入框    |
| number          | 数值输入框    |
| select          | 单选下拉框    |
| select-multiple | 多选下拉框    |
| checkbox        | 复选框        |
| switch          | 开关          |
| search-helper   | 搜索帮助      |
| date            | 日期类型      |
| datetime        | 日期-时间类型 |
| time            | 时间类型      |

### shParams

| 参数   | 说明                                   | 类型                        | 默认值 |
| ------ | -------------------------------------- | --------------------------- | ------ |
| cell   | 单元格的值                             | object                      | -      |
| row    | 行数据                                 | object                      | -      |
| column | 列配置                                 | object                      | -      |
| cb     | 回调函数，设置单元格的值并触发表单校验 | function(cellValue, others) | -      |
| event  | 单击事件的事件对象                     | object                      | -      |

### formatType

| 参数              | 说明          |
| ----------------- | ------------- |
| date              | 日期类型      |
| datetime          | 日期-时间类型 |
| finance           | 金融格式      |
| secret-name       | 姓名保密      |
| secret-phone      | 电话保密      |
| secret-IDnumber   | 身份证保密    |
| secret-bankNumber | 银行卡保密    |

### item

| 参数  | 说明         | 类型             | 默认值 |
| ----- | ------------ | ---------------- | ------ |
| text  | 列表项的文本 | string           | -      |
| value | 列表项的值   | string \| number | -      |

### extra

| 参数        | 说明                                 | 类型             | 默认值 |
| ----------- | ------------------------------------ | ---------------- | ------ |
| maxlength   | 最大长度                             | number           | -      |
| max         | 最大值                               | number           | -      |
| min         | 最小值                               | number           | 0      |
| readonly    | 是否只读，search-helper 生效         | boolean          | true   |
| trueValue   | 选中的值，checkbox 生效              | string \| number | -      |
| falseValue  | 非选中值，checkbox 生效              | string \| number | -      |
| minDateTime | 最小日期，小于该时间的日期段将被禁用 | string           | -      |
| maxDateTime | 最大日期，大于该时间的日期段将被禁用 | string           | -      |
| text        | 显示的文本，checkbox 生效            | string           | -      |
| disabled    | 表单禁用状态                         | boolean          | -      |
| clearable   | 是否显示清除按钮                     | boolean          | true   |

### helper

| 参数          | 说明                                                                            | 类型                                         | 默认值 |
| ------------- | ------------------------------------------------------------------------------- | -------------------------------------------- | ------ |
| filters       | 顶部筛选条件配置，参考 TopFilter 组件，必要参数                                 | array                                        | -      |
| table         | 列表组件配置，[配置项](#table)，必要参数                                        | array                                        | -      |
| fieldAliasMap | 表单字段与回传数据字段的映射，[配置项](#alias)， 必要参数                       | func                                         | -      |
| beforeOpen    | 打开搜索帮助的前置钩子，若返回 false 或者返回 Promise 且被 reject，则阻止打开   | function(cell, row, column)                  | -      |
| beforeClose   | 关闭搜索帮助的前置钩子，，若返回 false 或者返回 Promise 且被 reject，则阻止关闭 | function(searchHelperRow, cell, row, column) | -      |
| closed        | 关闭搜索帮助的后置钩子                                                          | function(row)                                | -      |

### rule

| 参数      | 说明                                      | 类型                         | 默认值 |
| --------- | ----------------------------------------- | ---------------------------- | ------ |
| required  | 是否必填                                  | boolean                      | -      |
| message   | 提示信息                                  | string                       | -      |
| validator | 自定义校验规则，返回值 true，表示通过校验 | function(cellValue): boolean | -      |

### summation

| 参数     | 说明                                                | 类型                    | 默认值 |
| -------- | --------------------------------------------------- | ----------------------- | ------ |
| dataKey  | 服务端合计，合计数据的 key，支持 `a.b.c` 的路径写法 | string                  | -      |
| unit     | 合计字段的单位                                      | string                  | -      |
| onChange | 字段合计变化时触发                                  | function(value: number) | -      |

### groupSummary

| 参数    | 说明                                                | 类型   | 默认值 |
| ------- | --------------------------------------------------- | ------ | ------ |
| dataKey | 服务端合计，合计数据的 key，支持 `a.b.c` 的路径写法 | string | -      |
| unit    | 合计字段的单位                                      | string | -      |

### rowSelection

| 参数                  | 说明                                       | 类型                                   | 默认值 |
| --------------------- | ------------------------------------------ | -------------------------------------- | ------ |
| type                  | 选择类型，必要参数                         | checkbox \| radio                      | -      |
| selectedRowKeys       | 选中项的 rowKey 数组                       | string[]                               | -      |
| checkStrictly         | 选择列完全受控（父子数据选中状态不再关联） | boolean                                | true   |
| defaultSelectFirstRow | 是否默认选中第一行（单选时生效）           | boolean                                | false  |
| disabled              | 是否允许行选择                             | function(row): boolean                 | -      |
| onChange              | 选中项发生变化时触发                       | function(selectionKeys, selectionRows) | -      |

### rowHighlight

| 参数          | 说明                 | 类型                               | 默认值 |
| ------------- | -------------------- | ---------------------------------- | ------ |
| currentRowKey | 当前高亮行的 rowKey  | string \| number                   | -      |
| disabled      | 是否允许行高亮       | function(row): boolean             | -      |
| onChange      | 高亮行发生变化时触发 | function(highlightKey, currentRow) | -      |

### expandable

| 参数                 | 说明                           | 类型                                 | 默认值 |
| -------------------- | ------------------------------ | ------------------------------------ | ------ |
| defaultExpandAllRows | 默认展开所有行                 | boolean                              | -      |
| expandedRowKeys      | 展开行的 rowKey 数组           | string[]                             | -      |
| rowExpandable        | 是否允许行展开                 | function(row): boolean               | -      |
| expandedRowRender    | 额外的展开行渲染方法，必要参数 | function(row, index): JSX Node       | -      |
| onExpand             | 点击展开图标时触发             | function(expanded, row)              | -      |
| onChange             | 展开的行变化时触发             | function(expandedKeys, expandedRows) | -      |

### pagination

| 参数            | 说明                 | 类型     | 默认值                           |
| --------------- | -------------------- | -------- | -------------------------------- |
| layout          | 分页组件的布局       | string   | prev, pager, next, jumper, sizes |
| currentPage     | 当前页数             | number   | 1                                |
| pageSize        | 每页显示条目个数     | number   | 20                               |
| pagerCount      | 页码按钮的数量       | number   | 7                                |
| pageSizeOptions | 个数选择器的选项列表 | number[] | [10, 20, 30, 40, 50]             |

### treeStructure

| 参数                 | 说明                   | 类型     | 默认值 |
| -------------------- | ---------------------- | -------- | ------ |
| defaultExpandAllRows | 默认展开树表格的所有行 | boolean  | -      |
| expandedRowKeys      | 展开行的 rowKey 数组   | string[] | -      |

### exportExcel

| 参数     | 说明                                         | 类型   | 默认值                |
| -------- | -------------------------------------------- | ------ | --------------------- |
| fileName | 导出的文件名，需包含扩展名 xlsx \| csv       | string | [当前时间字符串].xlsx |
| fetch    | 导出文件的接口(服务端导出)，[配置项](#fetch) | object | -                     |

### tablePrint

| 参数     | 说明                | 类型    | 默认值 |
| -------- | ------------------- | ------- | ------ |
| showLogo | 是否显示打印单 Logo | boolean | true   |
| showSign | 是否显示签名        | boolean | false  |

## 注意

1. 在 Table 中，`dataSource` 和 `columns` 里的数据值都需要指定 `key` 值。对于 `dataSource` 默认将每列数据的 `key` 属性作为唯一的标识。

2. 如果你的数据没有这个属性，务必使用 `rowKey` 来指定数据列的主键。若没有指定，控制台会出现缺少 key 的提示，表格组件也会出现各类奇怪的错误。

3. 表格支持树形数据的展示，当数据中有 children 字段时会自动展示为树形表格，渲染形表格时，必须要指定 rowKey 且值不能为 index。

```bash
// 比如你的数据主键是 uid
return <Table rowKey="uid" />;
// 或
return <Table rowKey={record: record.uid} />;
```
