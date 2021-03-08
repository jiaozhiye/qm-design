<script lang="tsx">
import { defineComponent, VNode } from 'vue';

import PrintTemplate from './demo2';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export default defineComponent({
  name: 'App',
  data() {
    this.templateRender = null;
    return {
      expand: true,
      loading: false,
      visible: false,
      visible2: false,
      tabName: 'second',
      btnList: [1, 2],
      formList: [
        // {
        //   type: 'BREAK_SPACE',
        //   label: '条件6',
        //   fieldName: 'z',
        //   collapse: {
        //     showLimit: 2,
        //     remarkItems: [{ fieldName: 'e' }],
        //   },
        // },
        {
          type: 'MULTIPLE_TREE_SELECT',
          label: '条件6',
          fieldName: 'a',
          options: {
            itemList: [
              {
                value: '1',
                text: '一级 1',
                children: [
                  {
                    value: '4',
                    text: '二级 1-1',
                    children: [
                      {
                        value: '9',
                        text: '三级 1-1-1',
                      },
                      {
                        value: '10',
                        text: '三级 1-1-2',
                      },
                    ],
                  },
                ],
              },
              {
                value: '2',
                text: '一级 2',
                children: [
                  {
                    value: '5',
                    text: '二级 2-1',
                  },
                  {
                    value: '6',
                    text: '二级 2-2',
                  },
                ],
              },
              {
                value: '3',
                text: '一级 3',
                children: [
                  {
                    value: '7',
                    text: '二级 3-1',
                  },
                  {
                    value: '8',
                    text: '二级 3-2',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'SELECT',
          fieldName: 'b',
          label: '表单项2',
          options: {
            itemList: [
              { text: '标题1', value: '1' },
              { text: '标题2', value: '2' },
              { text: '标题3', value: '3' },
              { text: '标题4', value: '4' },
              { text: '大海', value: '5' },
            ],
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
          render: (opt, ctx) => {
            const { fieldName } = opt;
            return <el-input v-model={ctx.form[fieldName]} />;
          },
        },
        {
          type: 'SWITCH',
          fieldName: 'e',
          label: '表单项5',
        },
      ],
      printDataList: [],
      content: '',
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
        <qm-table></qm-table>
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
