/*
 * @Author: 焦质晔
 * @Date: 2020-05-19 19:15:37
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-10 11:16:16
 */
import { defineComponent } from 'vue';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

import EmptyIcon from '../icon/empty';

export default defineComponent({
  name: 'EmptyEle',
  render(): JSXNode {
    return (
      <div class="empty--wrapper">
        <span class="icon">
          <EmptyIcon />
        </span>
        <span class="text">{t('qm.table.config.emptyText')}</span>
      </div>
    );
  },
});
