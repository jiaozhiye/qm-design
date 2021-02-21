<script lang="ts">
import { defineComponent, VNode } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      expand: true,
    };
  },
  methods: {
    clickHandle() {
      this.$message.success('asdasd');
    },
  },
  render(): VNode {
    return (
      <>
        <qm-space spacer={'|'}>
          <qm-button onClick={this.clickHandle} />
          <qm-button onClick={this.clickHandle} />
          <qm-button onClick={this.clickHandle} />
        </qm-space>
        <qm-divider
          v-model={[this.expand, 'collapse']}
          label="标题名称"
          extra="asdasdasdasdasd"
        ></qm-divider>
        <qm-anchor style="height: 400px">
          <div>asdasd</div>
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
