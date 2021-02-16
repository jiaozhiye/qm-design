<script lang="ts">
import { defineComponent, VNode } from 'vue';

export default defineComponent({
  name: 'App',
  methods: {
    clickHandle() {
      this.$message.success('asdasd');
    },
  },
  render(): VNode {
    return (
      <>
        <h3>vue3-cli</h3>
        <h5 class="iconfont icon-delete">hello world</h5>
        <qm-button onClick={this.clickHandle} />
      </>
    );
  },
});
</script>

<style></style>
