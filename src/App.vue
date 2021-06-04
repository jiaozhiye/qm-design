<script lang="tsx">
import { defineComponent, VNode } from 'vue';
import { getTableData, getSelectData, getTreeData, getRegionData } from './api/test';

export default defineComponent({
  name: 'App',
  data() {
    this.templateRender = null;
    this.selectedKeys = [];
    return {
      visible: false,
      formList: [
        {
          type: 'CITY_SELECT',
          label: '条件9',
          fieldName: 'g',
        },
        {
          type: 'REGION_SELECT',
          label: '条件7',
          fieldName: 'f',
          request: {
            fetchStreetApi: getSelectData,
            params: {},
            datakey: 'records',
            valueKey: 'value',
            textKey: 'text',
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
      ],
    };
  },
  methods: {
    clickHandle() {
      this.visible = true;
    },
  },
  render(): VNode {
    return (
      <>
        <qm-button click={this.clickHandle}>按钮</qm-button>
        <qm-drawer v-model={[this.visible, 'visible']} title="抽屉标题" destroyOnClose containerStyle={{ paddingBottom: '30px' }}>
          <div style="height: 1000px">
            <qm-form list={this.formList} />
          </div>
          <div style="position: absolute; left: 0; bottom: 0; right: 0;">footer</div>
        </qm-drawer>
      </>
    );
  },
});
</script>
