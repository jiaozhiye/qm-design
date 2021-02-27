<script lang="ts">
import { defineComponent, VNode } from 'vue';

const sleep = async (delay: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export default defineComponent({
  name: 'App',
  data() {
    return {
      expand: true,
      loading: false,
      visible: false,
      visible2: false,
      tabName: 'second',
      btnList: [1, 2],
      formList: [
        {
          type: 'TREE_SELECT',
          label: '条件6',
          fieldName: 'a',
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
          type: 'RANGE_DATE',
          fieldName: 'c',
          label: '表单项3',
        },
        {
          type: 'INPUT',
          fieldName: 'd',
          label: '表单项4',
        },
        {
          type: 'INPUT',
          fieldName: 'e',
          label: '表单项5',
        },
      ],
    };
  },
  methods: {
    clickHandle(k) {
      console.log(1111, k);
      // this.$message.success('asdasd');
      // this.loading = false;
      // this.visible = true;
      // this.visible2 = true;
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
          <span>asdasd</span>
        </qm-space>
        <qm-form
          list={this.formList}
          initialValue={{}}
          formType="search"
          onFinish={this.finish}
          fieldsChange={(list) => {
            this.formList = list;
          }}
        ></qm-form>
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
        <qm-divider
          v-model={[this.expand, 'collapse']}
          label="标题名称"
          extra="asdasdasdasdasd"
        ></qm-divider>
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
        <qm-drawer
          v-model={[this.visible, 'visible']}
          title="抽屉标题"
          destroyOnClose
          containerStyle={{ paddingBottom: '30px' }}
        >
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-drawer>
        <qm-dialog
          v-model={[this.visible2, 'visible']}
          title="抽屉标题"
          destroyOnClose
          containerStyle={{ paddingBottom: '30px' }}
        >
          <div style="height: 1000px">asd</div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-dialog>
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
