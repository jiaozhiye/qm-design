/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 14:44:02
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop, toDate, dateFormat } from './utils';
import { getParserWidth } from '../../_utils/util';
import { DATE_RANGE_CONF } from './types';

export default defineComponent({
  name: 'FormRangeDateEl',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  methods: {
    // 设置日期控件的禁用状态
    setDisabledDate(oDate: Date, [minDateTime, maxDateTime]): boolean {
      const min = minDateTime ? dayjs(minDateTime).toDate().getTime() : 0;
      const max = maxDateTime ? dayjs(maxDateTime).toDate().getTime() : 0;
      if (min && max) {
        return !(oDate.getTime() >= min && oDate.getTime() <= max);
      }
      if (!!min) {
        return oDate.getTime() < min;
      }
      if (!!max) {
        return oDate.getTime() > max;
      }
      return false;
    },
  },
  render(): JSXNode {
    const { form } = this.$$form;
    const {
      type,
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      style = {},
      placeholder,
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const {
      dateType = 'daterange',
      minDateTime,
      maxDateTime,
      shortCuts = !0,
      unlinkPanels = !0,
    } = options;

    this.$$form.setViewValue(fieldName, form[fieldName].join('-'));

    // 日期区间快捷键方法
    const pickers = [
      {
        text: t('qm.form.dateRangePickers')[0],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers')[1],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers')[2],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 90);
          return date;
        })(),
      },
      {
        text: t('qm.form.dateRangePickers')[3],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 180);
          return date;
        })(),
      },
    ];

    const wrapProps = {
      modelValue: toDate(form[fieldName]),
      'onUpdate:modelValue': (val) => {
        form[fieldName] = dateFormat(val ?? [], DATE_RANGE_CONF[dateType].valueFormat);
      },
    };

    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth && getParserWidth(labelWidth)}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel(labelOptions),
        }}
      >
        <el-date-picker
          type={dateType.replace('exact', '')}
          {...wrapProps}
          range-separator={'-'}
          start-placeholder={!disabled ? DATE_RANGE_CONF[dateType].placeholder[0] : ''}
          end-placeholder={!disabled ? DATE_RANGE_CONF[dateType].placeholder[1] : ''}
          unlink-panels={unlinkPanels}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          disabledDate={(time: Date): boolean => {
            return this.setDisabledDate(time, [minDateTime, maxDateTime]);
          }}
          shortcuts={shortCuts ? pickers : null}
          onChange={(): void => onChange(form[fieldName])}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
