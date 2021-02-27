/*
 * @Author: 焦质晔
 * @Date: 2021-02-23 21:56:33
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-27 16:49:34
 */
import { defineComponent } from 'vue';
import addEventListener from 'add-dom-event-listener';
import dayjs from 'dayjs';
import { JSXNode, Nullable } from '../../_utils/types';

import { t } from '../../locale';
import { noop, toDate, dateFormat } from './utils';
import { getParserWidth } from '../../_utils/util';
import { DATE_RANGE_CONF } from './types';

export default defineComponent({
  name: 'FormRangeDate',
  inheritAttrs: false,
  inject: ['$$form'],
  props: ['option'],
  mounted() {
    const $startInput: HTMLInputElement = this.$refs[
      `RANGE_DATE__start`
    ].$el.nextElementSibling.querySelector('.el-input__inner');
    const $endInput: HTMLInputElement = this.$refs[
      `RANGE_DATE__end`
    ].$el.nextElementSibling.querySelector('.el-input__inner');
    this._start = addEventListener($startInput, 'input', (ev: Event): void => {
      this.startInputText = (ev.target as HTMLInputElement).value;
    });
    this._end = addEventListener($endInput, 'input', (ev: Event): void => {
      this.endInputText = (ev.target as HTMLInputElement).value;
    });
  },
  beforeUnmount() {
    this._start?.remove();
    this._end?.remove();
  },
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
      startDisabled,
      endDisabled,
      shortCuts = !0,
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

    const shortcutClickHandle = (ev: Event): void => {
      if ((ev.target as HTMLElement).nodeName !== 'BUTTON') return;
      !endDisabled && (form[fieldName][1] = `${dayjs().format('YYYY-MM-DD')} 23:59:59`);
    };

    const startWrapProps = {
      modelValue: toDate(form[fieldName][0]),
      'onUpdate:modelValue': (val) => {
        form[fieldName] = [
          dateFormat(val ?? undefined, DATE_RANGE_CONF[dateType].valueFormat),
          form[fieldName][1],
        ];
      },
    };

    const endWrapProps = {
      modelValue: toDate(form[fieldName][1]),
      'onUpdate:modelValue': (val) => {
        form[fieldName] = [
          form[fieldName][0],
          dateFormat(val ?? undefined, DATE_RANGE_CONF[dateType].valueFormat),
        ];
      },
    };

    const cls = [`range-date`, { [`disabled`]: disabled }];

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
        <div class={cls} style={{ width: '100%', ...style }}>
          <el-date-picker
            ref={`${type}__start`}
            type={dateType.replace('exact', '').slice(0, -5)}
            popper-class={`date-picker__${fieldName}`}
            {...startWrapProps}
            range-separator={'-'}
            placeholder={!disabled ? DATE_RANGE_CONF[dateType].placeholder[0] : ''}
            readonly={readonly}
            clearable={clearable}
            disabled={disabled || startDisabled}
            style={{ width: `calc(50% - 7px)` }}
            disabledDate={(time: Date): boolean => {
              return this.setDisabledDate(time, [minDateTime, form[fieldName][1]]);
            }}
            shortcuts={shortCuts ? pickers : null}
            onChange={(): void => onChange(form[fieldName])}
            onFocus={(): void => {
              this.$nextTick(() => {
                const $pickerBar: Nullable<HTMLElement> = document
                  .querySelector(`.date-picker__${fieldName}`)
                  .querySelector('.el-picker-panel__sidebar');
                if ($pickerBar?.nodeType === 1) {
                  this._event = addEventListener($pickerBar, 'click', shortcutClickHandle);
                }
              });
            }}
            onBlur={() => {
              setTimeout(() => this._event?.remove(), 300);
              if (!['daterange', 'exactdaterange', 'datetimerange'].includes(dateType)) return;
              let val: string = this.startInputText || '';
              // 检测格式是否合法
              if (!/^[\d-\s\:]+$/.test(val)) return;
              const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
              const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
              if (dateType === 'daterange' || dateType === 'exactdaterange') {
                val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
              }
              if (dateType === 'datetimerange') {
                val = val
                  .replace(dateReg, '$1-$2-$3')
                  .replace(dateTimeReg, '$1-$2-$3 $4:$5:$6')
                  .slice(0, 19);
              }
              const passed: boolean = !this.setDisabledDate(dayjs(val).toDate(), [
                minDateTime,
                form[fieldName][1],
              ]);
              if (!passed) return;
              form[fieldName][0] = val;
            }}
          />
          <span
            class={disabled ? 'is-disabled' : ''}
            style="display: inline-block; text-align: center; width: 14px;"
          >
            -
          </span>
          <el-date-picker
            ref={`${type}__end`}
            type={dateType.replace('exact', '').slice(0, -5)}
            {...endWrapProps}
            range-separator={'-'}
            placeholder={!disabled ? DATE_RANGE_CONF[dateType].placeholder[1] : ''}
            readonly={readonly}
            clearable={clearable}
            disabled={disabled || endDisabled}
            style={{ width: `calc(50% - 7px)` }}
            disabledDate={(time: Date): boolean => {
              return this.setDisabledDate(time, [form[fieldName][0], maxDateTime]);
            }}
            onChange={(): void => onChange(form[fieldName])}
            onBlur={() => {
              if (!['daterange', 'exactdaterange', 'datetimerange'].includes(dateType)) return;
              let val: string = this.endInputText || '';
              // 检测格式是否合法
              if (!/^[\d-\s\:]+$/.test(val)) return;
              const dateReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2})/;
              const dateTimeReg: RegExp = /^(\d{4})-?(\d{2})-?(\d{2}) (\d{2}):?(\d{2}):?(\d{2})/;
              if (dateType === 'daterange' || dateType === 'exactdaterange') {
                val = val.replace(dateReg, '$1-$2-$3').slice(0, 10);
              }
              if (dateType === 'datetimerange') {
                val = val
                  .replace(dateReg, '$1-$2-$3')
                  .replace(dateTimeReg, '$1-$2-$3 $4:$5:$6')
                  .slice(0, 19);
              }
              const passed: boolean = !this.setDisabledDate(dayjs(val).toDate(), [
                form[fieldName][0],
                maxDateTime,
              ]);
              if (!passed) return;
              form[fieldName][1] = val;
            }}
          />
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
