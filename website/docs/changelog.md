## 更新日志

`qm-design` 严格遵循 Semantic Versioning 2.0.0 语义化版本规范。

### 1.0.0-beta.24

2021-02-29

- 🌟 [Drawer] 新增了 START_LOADING、STOP_LOADING 方法
- 🌟 [Dialog] 新增了 START_LOADING、STOP_LOADING 方法

### 1.0.0-beta.23

2021-02-28

- 🌟 [Table] 重构并优化了表格组件虚拟滚动算法
- 🌟 [Table] 表格分组小计 + 虚拟滚动，支持了单元格合并
- 🐞 修复组件 bug

### 1.0.0-beta.22

2021-02-25

- 🌟 [Table] 优化了表格组件
- 🌟 [Form] 优化了表单组件
- 🐞 修复组件 bug

### 1.0.0-beta.21

2021-02-24

- 🎉 [Table] 行选择新增了 fetchSelectedRows 参数，用于从服务端获取要回显的数据列表
- 🎉 [Table] 行选择新增了 fetchAllRowKeys 参数，用于从服务端获取所有行数据 rowKey 的列表
- 🎉 [Form] 新增了 SET_INITIAL_VALUE 方法，设置表单的初始值，用于异步获取初始值的情况
- 🌟 vue 升级到了 3.1.2
- 🐞 修复组件 bug

### 1.0.0-beta.17

2021-02-22

- 🎉 [Table] 底部合计支持了单独接口获取服务端数据
- 🎉 [Table] 后台分页 + 列复选，支持了从服务端获取数据行进行复选框的回显
- 🎉 [Table] 分组小计支持忽略数据行
- 🌟 [Table] 服务端合计的变更：1. 合计值需放在 `summation` 属性中; 2. column.summation.dataKey 设置时无需包含 `summation`

### 1.0.0-beta.16

2021-02-22

- 🐞 修复组件 bug

### 1.0.0-beta.15

2021-02-21

- 🐞 修复组件 bug

### 1.0.0-beta.14

2021-06-18

- 🐞 修复组件 bug
