<script lang="tsx">
import { defineComponent, VNode } from 'vue';

import PrintTemplate from './demo2';

import { getTableData, getSelectData, getTreeData } from './api/test';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export default defineComponent({
  name: 'App',
  data() {
    this.templateRender = null;
    this.selectedKeys = [];
    return {
      expand: true,
      loading: false,
      visible: false,
      visible2: false,
      tabName: 'second',
      btnList: [1, 2],
      formList: [
        {
          type: 'INPUT',
          label: '条件1',
          fieldName: 'z',
          searchHelper: {
            filters: [
              {
                type: 'INPUT',
                label: '条件1',
                fieldName: 'a1',
              },
              {
                type: 'INPUT',
                label: '条件2',
                fieldName: 'a2',
              },
              {
                type: 'INPUT',
                label: '条件3',
                fieldName: 'a3',
              },
              {
                type: 'INPUT',
                label: '条件4',
                fieldName: 'a4',
              },
            ],
            table: {
              columns: [
                {
                  title: '创建时间',
                  dataIndex: 'date',
                },
                {
                  title: '姓名',
                  dataIndex: 'person.name',
                },
              ],
              rowKey: (record) => record.id,
              fetch: {
                api: getTableData,
                params: {},
                dataKey: 'records',
              },
            },
            filterAliasMap: () => {
              return ['a1'];
            },
            fieldAliasMap: () => {
              return { z: 'date', code: 'id', z__desc: 'date', d: 'date', d__desc: 'date' };
            },
          },
          style: { width: `calc(100% - 80px)` },
          descOptions: {
            style: { width: '70px' },
          },
          onChange: (val) => {
            console.log(1234, val);
          },
        },
        {
          type: 'MULTIPLE_TREE_SELECT',
          label: '条件6',
          fieldName: 'a',
          request: {
            fetchApi: getTreeData,
            params: {},
            datakey: 'records',
          },
        },
        {
          type: 'SELECT',
          fieldName: 'b',
          label: '表单项2',
          labelOptions: {
            description: 'asdasd',
          },
          request: {
            fetchApi: getSelectData,
            params: {},
            datakey: 'records',
            valueKey: 'value',
            textKey: 'text',
          },
        },
        {
          type: 'UPLOAD_IMG',
          fieldName: 'c',
          label: '表单项3',
          upload: {
            actionUrl: '/api/file/oss/upload',
            fixedSize: [5, 3],
            isCalcHeight: true,
            limit: 1,
            params: {},
          },
        },
        {
          type: 'INPUT',
          fieldName: 'd',
          label: '表单项4',
          style: { width: `calc(100% - 80px)` },
          descOptions: {
            style: { width: '70px' },
          },
          // render: (opt, ctx) => {
          //   const { fieldName } = opt;
          //   return <el-input v-model={ctx.form[fieldName]} />;
          // },
        },
        {
          type: 'SWITCH',
          fieldName: 'e',
          label: '表单项5',
        },
      ],
      printDataList: [],
      content: '',
      fetch: {
        api: getTableData,
        params: {},
        dataKey: 'records',
      },
      columns: [
        {
          title: '操作',
          dataIndex: '__action__', // 操作列的 dataIndex 的值不能改
          fixed: 'left',
          width: 100,
          render: (text, row) => {
            return (
              <div>
                <el-button type="text">编辑</el-button>
                <el-button type="text">查看</el-button>
              </div>
            );
          },
        },
        {
          title: '序号',
          description: '数据索引',
          dataIndex: 'pageIndex',
          width: 80,
          sorter: true,
          render: (text) => {
            return text + 1;
          },
        },
        {
          title: '创建时间',
          dataIndex: 'date',
          width: 220,
          sorter: true,
          filter: {
            type: 'date',
          },
          editRender: (row) => {
            return {
              type: 'datetime',
            };
          },
        },
        {
          title: '个人信息',
          dataIndex: 'person',
          children: [
            {
              title: '姓名',
              dataIndex: 'person.name',
              width: 200,
              required: true,
              sorter: true,
              filter: {
                type: 'text',
              },
              editRender: (row) => {
                const obj = {
                  type: 'search-helper',
                  // editable: true,
                  extra: {
                    readonly: false,
                    maxlength: 10,
                    disabled: row.id === 3,
                  },
                  helper: {
                    filters: [
                      {
                        type: 'INPUT',
                        label: '条件1',
                        fieldName: 'a',
                      },
                    ],
                    table: {
                      columns: [
                        {
                          title: '创建时间',
                          dataIndex: 'date',
                          filter: {
                            type: 'date',
                          },
                        },
                        {
                          title: '姓名',
                          dataIndex: 'person.name',
                        },
                      ],
                      rowKey: (record) => record.id,
                      fetch: {
                        api: getTableData,
                        params: {},
                        dataKey: 'records',
                      },
                    },
                    fieldAliasMap: () => {
                      return { 'person.name': 'date', 'person.age': 'date' };
                    },
                    filterAliasMap: () => {
                      return ['a'];
                    },
                    closed: () => {
                      obj.helper.initialValue = { a: '' };
                    },
                  },
                  rules: [{ required: true, message: '姓名不能为空' }],
                  // onChange: (cellVal, row) => {
                  //   const keys = Object.keys(cellVal)[0].split('|');
                  //   obj.helper.initialValue = { a: '1234' };
                  //   this.$refs.table.OPEN_SEARCH_HELPER(keys[0], keys[1]);
                  // },
                  // onClick: (cell, row, column, cb, ev) => {
                  //   this.tableShProps = Object.assign({}, this.tableShProps, {
                  //     dataIndex: column.dataIndex,
                  //     fieldAliasMap: () => {
                  //       return { 'person.name': 'date', 'person.age': 'date' };
                  //     },
                  //     callback: cb
                  //   });
                  //   this.visible_table = true;
                  // }
                };
                return obj;
              },
            },
            {
              title: '性别',
              dataIndex: 'person.sex',
              width: 100,
              dictItems: [
                { text: '男', value: '1' },
                { text: '女', value: '0' },
              ],
            },
            {
              title: '年龄',
              dataIndex: 'person.age',
              width: 100,
              sorter: true,
              filter: {
                type: 'number',
              },
              // editRender: row => {
              //   return {
              //     type: 'search-helper',
              //     // editable: true,
              //     helper: {
              //       filters: [
              //         {
              //           type: 'INPUT',
              //           label: '条件1',
              //           fieldName: 'a'
              //         }
              //       ],
              //       table: {
              //         columns: [
              //           {
              //             title: '创建时间',
              //             dataIndex: 'date',
              //             filter: {
              //               type: 'date'
              //             }
              //           },
              //           {
              //             title: '姓名',
              //             dataIndex: 'person.name'
              //           }
              //         ],
              //         rowKey: record => record.id,
              //         fetch: {
              //           api: () => {},
              //           params: {},
              //           dataKey: 'items'
              //         }
              //       },
              //       fieldAliasMap: () => {
              //         return { 'person.age': 'date', 'person.name': 'date' };
              //       }
              //     }
              //   };
              // }
            },
          ],
        },
        {
          title: '价格',
          dataIndex: 'price',
          width: 150,
          precision: 2,
          required: true,
          sorter: true,
          groupSummary: true,
          filter: {
            type: 'number',
          },
          editRender: (row) => {
            return {
              type: 'number',
              extra: {
                max: 1000,
              },
              rules: [{ required: true, message: '价格不能为空' }],
            };
          },
        },
        {
          title: '数量',
          dataIndex: 'num',
          width: 150,
          required: true,
          sorter: true,
          groupSummary: true,
          filter: {
            type: 'number',
          },
          editRender: (row) => {
            return {
              type: 'number',
              extra: {
                max: 1000,
              },
              rules: [{ required: true, message: '数量不能为空' }],
            };
          },
        },
        {
          title: '总价',
          dataIndex: 'total',
          width: 150,
          precision: 2,
          align: 'right',
          sorter: true,
          groupSummary: true,
          filter: {
            type: 'number',
          },
          summation: {
            unit: '元',
          },
          render: (text, row) => {
            row.total = row.price * row.num;
            return <span>{row.total.toFixed(2)}</span>;
          },
          extraRender: (text, row) => {
            return Number(row.price * row.num).toFixed(2);
          },
        },
        {
          title: '是否选择',
          dataIndex: 'choice',
          align: 'center',
          width: 150,
          editRender: (row) => {
            return {
              type: 'checkbox',
              editable: true,
              extra: {
                trueValue: 1,
                falseValue: 0,
                disabled: true,
              },
            };
          },
          dictItems: [
            { text: '选中', value: 1 },
            { text: '非选中', value: 0 },
          ],
        },
        {
          title: '状态',
          dataIndex: 'state',
          width: 150,
          filter: {
            type: 'radio',
            items: [
              { text: '已完成', value: 1 },
              { text: '进行中', value: 2 },
              { text: '未完成', value: 3 },
            ],
          },
          editRender: (row) => {
            return {
              type: 'select',
              items: [
                { text: '已完成', value: 1 },
                { text: '进行中', value: 2 },
                { text: '未完成', value: 3 },
              ],
            };
          },
          dictItems: [
            { text: '已完成', value: 1 },
            { text: '进行中', value: 2 },
            { text: '未完成', value: 3 },
          ],
        },
        {
          title: '业余爱好',
          dataIndex: 'hobby',
          width: 150,
          filter: {
            type: 'checkbox',
            items: [
              { text: '篮球', value: 1 },
              { text: '足球', value: 2 },
              { text: '乒乓球', value: 3 },
              { text: '游泳', value: 4 },
            ],
          },
          editRender: (row) => {
            return {
              type: 'select-multiple',
              items: [
                { text: '篮球', value: 1 },
                { text: '足球', value: 2 },
                { text: '乒乓球', value: 3 },
                { text: '游泳', value: 4 },
              ],
            };
          },
          dictItems: [
            { text: '篮球', value: 1 },
            { text: '足球', value: 2 },
            { text: '乒乓球', value: 3 },
            { text: '游泳', value: 4 },
          ],
        },
        {
          title: '地址',
          dataIndex: 'address',
          width: 200,
          filter: {
            type: 'textarea',
          },
          editRender: (row) => {
            return {
              type: 'text',
            };
          },
        },
      ],
      selection: {
        type: 'checkbox',
        selectedRowKeys: this.selectedKeys,
        disabled: (row) => {
          return row.id === 3;
        },
        onChange: (val, rows) => {
          this.selectedKeys = val;
        },
      },
      tablePrint: {
        showLogo: true,
      },
      exportExcel: {
        fileName: '导出文件.xlsx',
      },
    };
  },
  methods: {
    clickHandle(k) {
      this.$refs[`gprint`].DO_PRINT();
      // this.$message.success('asdasd');
      // this.loading = false;
      // this.visible = true;
      // this.visible2 = true;
    },
    async printHandle3() {
      await sleep(1000);
      let res = [];
      for (let i = 0; i < 100; i++) {
        res[i] = i;
      }
      this.templateRender = PrintTemplate;
      this.printDataList = res;
    },
    async beforeLeave() {
      await sleep(1000);

      // new Promise((resolve, reject) => {
      //   setTimeout(() => {
      //     reject();
      //   }, 1000);
      // })
      //   .then(() => {
      //     console.log('成功');
      //   })
      //   .catch(() => {
      //     console.log('失败2');
      //   });

      // Promise.reject()
      //   .then(() => {
      //     console.log('成功');
      //   })
      //   .catch(() => {
      //     console.log('失败2');
      //   });

      // 注意
      // new Promise((resolve, reject) => reject()) === Promise.reject()

      return Promise.reject();
    },
    finish(val) {
      console.log(val);
    },
  },
  render(): VNode {
    return (
      <>
        <div style="margin: 10px;">
          <qm-table
            ref="table"
            uniqueKey="jzyDemoTable"
            maxHeight="300px"
            columns={this.columns}
            fetch={this.fetch}
            rowKey={(row) => row.id}
            rowSelection={this.selection}
            tablePrint={this.tablePrint}
            exportExcel={this.exportExcel}
            columnsChange={(columns) => (this.columns = columns)}
          ></qm-table>
        </div>
        <qm-form
          uniqueKey="jzy_filter"
          formType="search"
          list={this.formList}
          initialValue={{ b: '1', a: ['9', '5'], vvv: 9 }}
          onFinish={this.finish}
          fieldsChange={(list) => {
            this.formList = list;
          }}
        ></qm-form>
        {/* <qm-countup endValue={2020} />
        <qm-split direction="vertical" style="height: 300px">
          <qm-split-pane>asdasd</qm-split-pane>
          <qm-split-pane>zxczxc</qm-split-pane>
        </qm-split>
        <qm-space spacer={'|'} size={20}>
          {this.btnList.map((x) => (
            <qm-button
              class="asd"
              confirm={{
                onConfirm: () => {},
              }}
              click={this.clickHandle.bind(this, x)}
            >
              按钮
            </qm-button>
          ))}
          <qm-print uniqueKey="cprint_jzy" dataSource={this.printDataList} templateRender={this.templateRender} click={this.printHandle3}>
            客户端打印
          </qm-print>
        </qm-space>
        <qm-form
          uniqueKey="jzy_filter"
          formType="search"
          list={this.formList}
          initialValue={{}}
          onFinish={this.finish}
          fieldsChange={(list) => {
            this.formList = list;
          }}
        ></qm-form>
        <qm-anchor
          style="height: 100px"
          labelList={[
            { id: 'aaa', label: '标题1' },
            { id: 'bbb', label: '标题2' },
          ]}
        >
          <div id="aaa" style="height: 200px">
            1
          </div>
          <div id="bbb" style="height: 200px">
            2
          </div>
        </qm-anchor>
        <qm-tabs
          v-model={this.tabName}
          extraNode="asdasd"
          onChange={(name) => {
            console.log(11, name);
          }}
        >
          <div>asd</div>
          <qm-tab-pane label="用户管理" name="first">
            用户管理1
          </qm-tab-pane>
          <qm-tab-pane label="配置管理" name="second">
            配置管理2
          </qm-tab-pane>
          <qm-tab-pane label="角色管理" name="third">
            角色管理3
          </qm-tab-pane>
        </qm-tabs>
        <qm-divider v-model={[this.expand, 'collapse']} label="标题名称" extra="asdasdasdasdasd"></qm-divider>
        <qm-tinymce v-model={this.content} />
        <qm-spin spinning={this.loading} tip="Loading...">
          <qm-anchor style="height: 400px">
            <qm-anchor-item label="标题名称">
              <div class="box">内容1</div>
            </qm-anchor-item>
            <qm-anchor-item label="页签名称">
              <div class="box">内容2</div>
            </qm-anchor-item>
            <qm-anchor-item label="导航名称">
              <div class="box">内容3</div>
            </qm-anchor-item>
          </qm-anchor>
        </qm-spin>
        <qm-drawer v-model={[this.visible, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-drawer>
        <qm-dialog v-model={[this.visible2, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-dialog>
        <qm-print-group ref="gprint">
          <qm-print-item label="打印1" dataSource={[1]} templateRender={PrintTemplate} />
          <qm-print-item label="打印2" dataSource={[]} templateRender={PrintTemplate} />
        </qm-print-group> */}
      </>
    );
  },
});
</script>

<style lang="scss">
.box {
  border: 1px solid #000;
  height: 300px;
}
</style>
