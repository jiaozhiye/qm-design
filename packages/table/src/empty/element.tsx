/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 19:15:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-08 13:39:56
 */
import { defineComponent } from 'vue';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

export default defineComponent({
  name: 'EmptyEle',
  render(): JSXNode {
    return (
      <div class="v-empty--wrapper">
        <SvgIcon class="icon" icon-class="empty" />
        <span class="text">{t('qm.table.config.emptyText')}</span>
      </div>
    );
  },
});
