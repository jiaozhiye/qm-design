/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 14:53:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-02 14:05:07
 */
import { defineComponent, PropType } from 'vue';
import { JSXNode } from '../../_utils/types';

import { LocalStorageMixin } from './local-storage-mixin';
import Draggable from 'vuedraggable';

import { isValidComponentSize } from '../../_utils/validators';
import { getPrefixCls } from '../../_utils/prefix';
import { deepToRaw } from '../../_utils/util';
import { t } from '../../locale';
import { IFormItem } from './types';

export default defineComponent({
  name: 'FieldsFilter',
  componentName: 'FieldsFilter',
  inject: ['$$form'],
  mixins: [LocalStorageMixin],
  props: {
    size: {
      type: String,
      validator: isValidComponentSize,
    },
    list: {
      type: Array,
    },
    uniqueKey: {
      type: String,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  render(): JSXNode {
    const { size, list } = this;
    const prefixCls = getPrefixCls('fields-filter');

    const wrapProps = {
      modelValue: list,
      itemKey: 'fieldName',
      animation: 200,
      handle: '.handle',
      tag: 'transition-group',
      componentData: {
        tag: 'ul',
        type: 'transition-group',
      },
      'onUpdate:modelValue': (val: IFormItem[]): void => {
        this.setLocalFields(deepToRaw(val));
        this.$$form.fieldsChange(val);
        // 自动展开
        this.$$form.collapse = true;
      },
    };

    const cls = {
      [prefixCls]: true,
      [`${prefixCls}--medium`]: size === 'medium',
      [`${prefixCls}--small`]: size === 'small',
      [`${prefixCls}--mini`]: size === 'mini',
    };

    return (
      <el-popover
        popper-class="popover-fields-filter"
        v-model={[this.visible, 'visible']}
        width={'auto'}
        trigger="click"
        placement="bottom-end"
        offset={5}
        transition="el-zoom-in-top"
        popper-options={{ gpuAcceleration: false }}
        append-to-body={true}
        stop-popper-mouse-event={false}
        gpu-acceleration={false}
        v-slots={{
          reference: (): JSXNode => (
            <el-button type="text">
              <i class="el-icon-s-operation" />
            </el-button>
          ),
        }}
      >
        <div class={cls}>
          <Draggable
            {...wrapProps}
            v-slots={{
              item: ({ element: item }): JSXNode => {
                const isDisabled: boolean = item.rules?.findIndex((x) => x.required) > -1;
                const checkboxProps = {
                  modelValue: !item.hidden,
                  disabled: isDisabled,
                  'onUpdate:modelValue': (val: boolean): void => {
                    item.hidden = !val;
                  },
                  onChange: (): void => {
                    this.setLocalFields(list);
                  },
                };
                return (
                  <li class="filter-item">
                    <el-checkbox {...checkboxProps} />
                    <i class="iconfont icon-menu handle" title={t('qm.form.draggable')} />
                    <span class="title" title={item.label}>
                      {item.label}
                    </span>
                  </li>
                );
              },
            }}
          />
        </div>
      </el-popover>
    );
  },
});
