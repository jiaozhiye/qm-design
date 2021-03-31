/*
 * @Author: 焦质晔
 * @Date: 2021-03-31 09:27:45
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-31 16:09:29
 */
import { defineComponent } from 'vue';
import scrollIntoView from 'scroll-into-view-if-needed';
import { getParserWidth, noop } from '../../_utils/util';
import { setStyle } from '../../_utils/dom';
import { JSXNode } from '../../_utils/types';
import { getPrefixCls } from '../../_utils/prefix';
import { province, city } from './china-data';
import { t } from '../../locale';
import { IDict } from './types';
import ClickOutside from '../../directives/click-outside';

type ICity = {
  l: string;
  n: string;
  c: string;
  p: string;
  children?: ICity[];
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
      letter_id: '',
      itemList: [], // 省市区，不包含街道
      visible: false,
    };
  },
  watch: {
    select_type(): void {
      this.letter_id = '';
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
      return Object.values(city).find((x) => x.c === val)?.n || '';
    },
    scrollHandle(val: string): void {
      this.letter_id = val;
      scrollIntoView(document.getElementById(val) as HTMLElement, {
        scrollMode: 'always',
        block: 'start',
        behavior: 'smooth',
        boundary: this.$refs[`scroll`],
      });
    },
    createProvince(): ICity[] {
      const res1: ICity[] = Object.values(province).filter((x) => x.l !== 'Z1' && x.l !== 'Z2');
      const res2: ICity = { l: 'Z1', n: '直辖市', c: '', p: '' };
      const res3: ICity = { l: 'Z2', n: '港澳', c: '', p: '' };
      res1.forEach((x) => (x.children = Object.values(city).filter((k) => k.p === x.c)));
      res2.children = Object.values(city).filter((k) => k.p === '86' && k.c !== '810000' && k.c !== '820000');
      res3.children = Object.values(city).filter((k) => k.p === '86' && (k.c === '810000' || k.c === '820000'));
      return [...res1, res2, res3];
    },
    createCity(): ICity[] {
      return citySelectLetter
        .filter((x) => x.value !== 'Z1' && x.value !== 'Z2')
        .map((x) => {
          return {
            l: x.value,
            n: x.text,
            c: '',
            p: '',
            children: Object.values(city).filter((k) => k.l === x.value),
          };
        });
    },
    renderCity(): JSXNode {
      const { form } = this.$$form;
      const { fieldName } = this.option;
      const cites: ICity[] = this.select_type === '0' ? this.createProvince() : this.createCity();
      return cites.map((x) => (
        <>
          <dt id={x.l}>{x.n}：</dt>
          <dd>
            {x.children?.map((k) => (
              <li key={k.c} class={{ actived: k.c === form[fieldName] }} onClick={() => this.clickHadnle(k.c)}>
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
            popper-class={`${prefixCls}__popper city-select__${fieldName}`}
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
                  v-click-outside={[() => (this.visible = !1), document.querySelector(`.city-select__${fieldName}`)]}
                  onVisibleChange={(visible: boolean): void => {
                    if (!visible) return;
                    setStyle(
                      document.querySelector(`.city-select__${fieldName}`) as HTMLElement,
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
                  <div class="city-drop-toper__type">
                    <el-radio-group v-model={this.select_type} size="mini">
                      <el-radio-button label="0">{t('qm.form.citySelectType')[0]}</el-radio-button>
                      <el-radio-button label="1">{t('qm.form.citySelectType')[1]}</el-radio-button>
                    </el-radio-group>
                  </div>
                  <div class="city-drop-toper__search">
                    <el-select
                      size="mini"
                      v-model={form[fieldName]}
                      placeholder={placeholder}
                      filterable
                      v-slots={{
                        default: (): JSXNode[] => Object.values(city).map((x) => <el-option key={x.c} value={x.c} label={x.n} />),
                      }}
                    />
                  </div>
                </div>
                <div class="city-drop-letter">
                  {citySelectLetter.map((x) => (
                    <div key={x.value} class={{ tag: !0, actived: x.value === this.letter_id }} onClick={() => this.scrollHandle(x.value)}>
                      {x.text}
                    </div>
                  ))}
                </div>
                <div ref="scroll" class="city-drop-list">
                  <dl>{this.renderCity()}</dl>
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
