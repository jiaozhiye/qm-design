/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 19:15:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 13:13:25
 */
import { defineComponent } from 'vue';
import { t } from '../../../locale';

export default defineComponent({
  name: 'EmptyEle',
  render() {
    return (
      <div class="v-empty--wrapper">
        <SvgIcon class="icon" icon-class="empty" />
        <span class="text">{t('qm.table.config.emptyText')}</span>
      </div>
    );
  },
});
