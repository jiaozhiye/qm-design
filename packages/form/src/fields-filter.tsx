/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 14:53:54
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 16:57:13
 */
import { defineComponent, PropType } from 'vue';
import { JSXNode } from '../../_utils/types';

import Draggable from 'vuedraggable';

import { getPrefixCls } from '../../_utils/prefix';
import { isValidComponentSize } from '../../_utils/validators';

export default defineComponent({
  name: 'FieldsFilter',
  componentName: 'FieldsFilter',
  inject: ['$$form'],
  props: {
    size: {
      type: String,
      validator: isValidComponentSize,
    },
    list: {
      type: Array,
    },
    fieldsChange: {
      type: Function,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  render(): JSXNode {
    const { size } = this;
    const prefixCls = getPrefixCls('fields-filter');

    const wrapProps = {
      modelValue: this.list,
      itemKey: 'id',
      animation: 200,
      handle: '.v-handle',
      tag: 'transition-group',
      componentData: {
        tag: 'ul',
        type: 'transition-group',
      },
      'onUpdate:modelValue': (val) => {
        this.fieldsChange([...val]);
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
        v-model={[this.visible, 'visible']}
        width={'auto'}
        trigger="click"
        placement="bottom-end"
        transition="el-zoom-in-top"
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
              item: ({ element }) => (
                <li class="filter-item">
                  <el-checkbox />
                  <i class="iconfont icon-menu v-handle" title="排序" />
                  <span title={element.label}>{element.label}</span>
                </li>
              ),
            }}
          />
        </div>
      </el-popover>
    );
  },
});
