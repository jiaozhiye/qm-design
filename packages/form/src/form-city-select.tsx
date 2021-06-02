/*
 * @Author: 焦质晔
 * @Date: 2021-03-31 09:27:45
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-06-02 10:28:14
 */
import { defineComponent } from 'vue';
import { flatten } from 'lodash-es';
import scrollIntoView from 'scroll-into-view-if-needed';
import pinyin, { STYLE_FIRST_LETTER } from '../../pinyin/index';
import { getParserWidth, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { JSXNode } from '../../_utils/types';
import { getPrefixCls } from '../../_utils/prefix';
import { t } from '../../locale';
import { IDict } from './types';
import ClickOutside from '../../directives/click-outside';

import chinaData from './china-data';

type ICity = {
  l: string;
  n: string;
  c: string;
  p: string;
  children?: ICity[];
};

const zxsCodes: string[] = ['110000', '120000', '310000', '500000']; // 直辖市
const gaCodes: string[] = ['810000', '820000']; // 港澳

const formatChinaData = (data: any, key: string, step: number = 1): ICity[] | undefined => {
  if (step > 2 || !data[key]) return;
  const codes: string[] = key === '86' ? Object.keys(data[key]).filter((x) => ![...zxsCodes, ...gaCodes].includes(x)) : Object.keys(data[key]);
  return codes.map((x) => ({
    l: flatten(pinyin(data[key][x].slice(0, 1), { style: STYLE_FIRST_LETTER }))
      .join('')
      .toUpperCase(),
    n: data[key][x],
    c: x,
    p: key,
    children: formatChinaData(data, x, step + 1),
  }));
};

const createOther = (data: any, codes: string[]): ICity[] => {
  return codes.map((x) => ({
    l: flatten(pinyin(data['86'][x].slice(0, 1), { style: STYLE_FIRST_LETTER }))
      .join('')
      .toUpperCase(),
    n: data['86'][x],
    c: x,
    p: '86',
    children: undefined,
  }));
};

const citySelectLetter: IDict[] = [
  { text: 'A', value: 'A' },
  { text: 'F', value: 'F' },
  { text: 'G', value: 'G' },
  { text: 'H', value: 'H' },
  { text: 'J', value: 'J' },
  { text: 'L', value: 'L' },
  { text: 'N', value: 'N' },
  { text: 'Q', value: 'Q' },
  { text: 'S', value: 'S' },
  { text: 'T', value: 'T' },
  { text: 'X', value: 'X' },
  { text: 'Y', value: 'Y' },
  { text: 'Z', value: 'Z' },
  { text: '直辖市', value: 'Z1' },
  { text: '港澳', value: 'Z2' },
];

export default defineComponent({
  name: 'FormRegionSelect',
  inheritAttrs: false,
  inject: ['$$form'],
  directives: { ClickOutside },
  props: ['option'],
  data() {
    return {
      select_type: '0', // 0 -> 按省份    1 -> 按城市
      active_key: '',
      provinces: this.createProvince(), // 省份数据(递归结构)
      visible: false,
    };
  },
  computed: {
    cities(): ICity[] {
      const result: ICity[] = [];
      this.provinces.forEach((x) => result.push(...x.children));
      return result;
    },
  },
  watch: {
    select_type(): void {
      this.active_key = '';
      this.$refs[`scroll`].scrollTop = 0;
    },
  },
  methods: {
    clickHadnle(val: string): void {
      const { form } = this.$$form;
      const { fieldName } = this.option;
      form[fieldName] = val;
      this.visible = !1;
    },
    createTextValue(val: string): string {
      return this.cities.find((x) => x.c === val)?.n || '';
    },
    scrollHandle(val: string): void {
      this.active_key = val;
      scrollIntoView(this.$refs[val] as HTMLElement, {
        block: 'start',
        behavior: 'smooth',
        boundary: this.$refs[`scroll`],
      });
    },
    createProvince(): ICity[] {
      return [
        ...(formatChinaData(chinaData, '86') as ICity[]),
        { l: 'Z1', n: '直辖市', c: '', p: '', children: createOther(chinaData, zxsCodes) },
        { l: 'Z2', n: '港澳', c: '', p: '', children: createOther(chinaData, gaCodes) },
      ];
    },
    createCity(): ICity[] {
      const result: ICity[] = citySelectLetter
        .filter((x) => x.value !== 'Z1' && x.value !== 'Z2')
        .map((x) => {
          return {
            l: x.value,
            n: x.text,
            c: '',
            p: '',
            children: this.cities.filter((x) => ![...zxsCodes, ...gaCodes].includes(x.c)).filter((k) => k.l === x.value),
          };
        });
      return [
        ...result,
        { l: 'Z1', n: '直辖市', c: '', p: '', children: createOther(chinaData, zxsCodes) },
        { l: 'Z2', n: '港澳', c: '', p: '', children: createOther(chinaData, gaCodes) },
      ];
    },
    renderType(): JSXNode {
      return (
        <el-radio-group v-model={this.select_type} size="mini">
          <el-radio-button label="0">{t('qm.form.citySelectType')[0]}</el-radio-button>
          <el-radio-button label="1">{t('qm.form.citySelectType')[1]}</el-radio-button>
        </el-radio-group>
      );
    },
    renderLetter(): JSXNode[] {
      return citySelectLetter.map((x) => (
        <li key={x.value} class={{ tag: !0, actived: x.value === this.active_key }} onClick={() => this.scrollHandle(x.value)}>
          {x.text}
        </li>
      ));
    },
    renderCity(val: string): JSXNode[] {
      const cites: ICity[] = this.select_type === '0' ? this.createProvince() : this.createCity();
      return cites.map((x) => (
        <>
          <dt ref={x.l}>{x.n}：</dt>
          <dd>
            {x.children?.map((k) => (
              <li key={k.c} class={{ actived: k.c === val }} onClick={() => this.clickHadnle(k.c)}>
                {k.n}
              </li>
            ))}
          </dd>
        </>
      ));
    },
  },
  render(): JSXNode {
    const { form } = this.$$form;
    const {
      label,
      fieldName,
      labelWidth,
      labelOptions,
      descOptions,
      options = {},
      request = {},
      style = {},
      placeholder = t('qm.form.selectPlaceholder'),
      clearable = !0,
      readonly,
      disabled,
      onChange = noop,
    } = this.option;

    const prefixCls = getPrefixCls('city-select');

    let textValue: string = this.createTextValue(form[fieldName]);

    return (
      <el-form-item
        key={fieldName}
        label={label}
        labelWidth={labelWidth && getParserWidth(labelWidth)}
        prop={fieldName}
        v-slots={{
          label: (): JSXNode => labelOptions && this.$$form.createFormItemLabel({ label, ...labelOptions }),
        }}
      >
        <div class="city-select">
          <el-popover
            ref="popper"
            popper-class={`${prefixCls}__popper`}
            v-model={[this.visible, 'visible']}
            width="auto"
            trigger="manual"
            placement="bottom-start"
            transition="el-zoom-in-top"
            append-to-body={true}
            stop-popper-mouse-event={false}
            gpu-acceleration={false}
            v-slots={{
              reference: (): JSXNode => (
                <el-select
                  ref="select"
                  popper-class="select-option"
                  modelValue={textValue}
                  placeholder={!disabled ? placeholder : ''}
                  clearable={clearable}
                  disabled={disabled}
                  readonly={readonly}
                  style={readonly && { pointerEvents: 'none' }}
                  popper-append-to-body={false}
                  v-click-outside={($down, $up): void => {
                    if (document.getElementById(this.$refs[`popper`].popperId)?.contains($up)) return;
                    this.visible = !1;
                  }}
                  onVisibleChange={(visible: boolean): void => {
                    if (!visible) return;
                    setStyle(
                      document.getElementById(this.$refs[`popper`].popperId) as HTMLElement,
                      'minWidth',
                      `${this.$refs[`select`].$el.getBoundingClientRect().width}px`
                    );
                  }}
                  onClick={(): void => {
                    if (!(disabled || readonly)) {
                      this.visible = !this.visible;
                    }
                  }}
                  onClear={(): void => {
                    form[fieldName] = undefined;
                    onChange(form[fieldName], null);
                  }}
                />
              ),
            }}
          >
            <div class="container" style={{ ...style }}>
              <div class="city-drop">
                <div class="city-drop-toper">
                  <div class="city-drop-toper__type">{this.renderType()}</div>
                  <div class="city-drop-toper__search">
                    <el-select
                      size="mini"
                      v-model={form[fieldName]}
                      placeholder={placeholder}
                      filterable
                      v-slots={{
                        default: (): JSXNode[] => this.cities.map((x) => <el-option key={x.c} value={x.c} label={x.n} />),
                      }}
                    />
                  </div>
                </div>
                <div class="city-drop-letter">{this.renderLetter()}</div>
                <div ref="scroll" class="city-drop-list">
                  <dl>{this.renderCity(form[fieldName])}</dl>
                </div>
              </div>
            </div>
          </el-popover>
        </div>
        {descOptions && this.$$form.createFormItemDesc({ fieldName, ...descOptions })}
      </el-form-item>
    );
  },
});
