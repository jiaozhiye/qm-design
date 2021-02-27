/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 13:25:25
 */
import { defineComponent } from 'vue';
import dayjs from 'dayjs';
import { JSXNode } from '../../_utils/types';

import { t } from '../../locale';
import { noop, toDate, dateFormat } from './utils';
import { getParserWidth } from '../../_utils/util';
import { DATE_CONF } from './types';

export default defineComponent({
  name: 'FormDate',
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
      clearable,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;
    const { dateType = 'date', minDateTime, maxDateTime, shortCuts = !0 } = options;

    this.$$form.setViewValue(fieldName, form[fieldName]);

    // 日期快捷键方法
    const pickers = [
      {
        text: t('qm.form.datePickers')[0],
        value: new Date(),
      },
      {
        text: t('qm.form.datePickers')[1],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
          return date;
        })(),
      },
      {
        text: t('qm.form.datePickers')[2],
        value: (() => {
          const date = new Date();
          date.setTime(date.getTime() - 3600 * 1000 * 24 * 90);
          return date;
        })(),
      },
      {
        text: t('qm.form.datePickers')[3],
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
        form[fieldName] = dateFormat(val ?? undefined, DATE_CONF[dateType].valueFormat);
      },
      ...(dateType === 'week' ? { format: 'gggg 第 ww 周' } : null),
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
          ref={type}
          type={dateType.replace('exact', '')}
          {...wrapProps}
          range-separator={'-'}
          placeholder={!disabled ? DATE_CONF[dateType].placeholder : ''}
          clearable={clearable}
          readonly={readonly}
          disabled={disabled}
          style={{ ...style }}
          disabledDate={(time: Date): boolean => {
            return this.setDisabledDate(time, [minDateTime, maxDateTime]);
          }}
          shortcuts={shortCuts ? pickers : null}
          onChange={(): void => onChange(form[fieldName])}
          onBlur={() => {
            const types = ['date', 'exactdate', 'datetime'];
            if (!types.includes(dateType)) return;
            const target: HTMLInputElement = this.$refs[type].$el.nextElementSibling?.querySelector(
              '.el-input__inner'
            );
            if (!target) return;
            let val: string = target.value;
            // 检测格式是否合法
            if (!/^[\d-\s\:]+$/.test(val)) return;
            const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
            const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
            if (dateType === 'date' || dateType === 'exactdate') {
              val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
            }
            if (dateType === 'datetime') {
              val = val
                .replace(dateReg, '$1-$2-$3')
                .replace(dateTimeReg, '$1-$2-$3 $4:$5:$6')
                .slice(0, 19);
            }
            const passed: boolean = !this.setDisabledDate(dayjs(val).toDate(), [
              minDateTime,
              maxDateTime,
            ]);
            if (!passed) return;
            form[fieldName] = val;
          }}
        />
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
