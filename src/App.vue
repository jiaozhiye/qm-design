<script lang="ts">
import { defineComponent, VNode } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      expand: true,
      loading: true,
    };
  },
  methods: {
    clickHandle() {
      this.$message.success('asdasd');
      this.loading = false;
    },
  },
  render(): VNode {
    return (
      <>
        <qm-space spacer={'|'}>
          <qm-button size="large" class="asd" onClick={this.clickHandle}>
            按钮
          </qm-button>
        </qm-space>
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
