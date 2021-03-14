/*
 * @Author: 焦质晔
 * @Date: 2021-03-12 08:17:08
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-12 09:23:13
 */
import { defineComponent } from 'vue';
import { get, isFunction } from 'lodash-es';
import { ElMessage } from 'element-plus';
import { utils, write } from 'xlsx';
import dayjs from 'dayjs';
import PropTypes from '../../../_utils/vue-types';

import { getCellValue } from '../utils';
import { download } from '../../../_utils/download';
import { t } from '../../../locale';
import { JSXNode } from '../../../_utils/types';

const XLSX = {
  utils,
  write,
};

export default defineComponent({
  name: 'JsonToExcel',
  inheritAttrs: false,
  emits: ['success', 'error'],
  props: {
    // Json to download
    initialValue: PropTypes.array.def([]).isRequired,
    // fields inside the Json Object that you want to export
    fields: PropTypes.object.def({}).isRequired,
    // mime type [xlsx, csv]
    fileType: PropTypes.string.def('xlsx'),
    // filename to export
    fileName: PropTypes.string,
    // ajax function
    fetch: PropTypes.object.def({}),
    // sheet prefix
    workSheet: PropTypes.string.def('sheet'),
    // format data handle
    formatHandle: PropTypes.func,
    // event before generate was called
    beforeGenerate: PropTypes.func,
    // event before download pops up
    beforeFinish: PropTypes.func,
  },
  data() {
    Object.assign(this, { workbook: { SheetNames: [], Sheets: {} } });
    return {
      loading: false,
    };
  },
  computed: {
    // unique identifier
    idName() {
      var now = new Date().getTime();
      return 'export_' + now;
    },
    wbopts() {
      return {
        bookType: this.fileType,
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary',
      };
    },
  },
  methods: {
    async generate() {
      if (isFunction(this.beforeGenerate)) {
        await this.beforeGenerate();
      }
      let { api, params, dataKey } = this.fetch;
      let data = this.initialValue;
      if (api) {
        try {
          this.loading = !0;
          const res = await api(params);
          if (res.code === 200) {
            data = (!dataKey ? res.data : get(res.data, dataKey)) || [];
          }
        } catch (err) {}
        this.loading = !1;
      }
      if (!data.length) {
        return ElMessage.warning(t('qm.table.export.noData'));
      }
      if (this.formatHandle) {
        data = this.formatHandle(data);
      }
      let json = this.getProcessedJson(data, this.fields);
      // 执行导出
      this.export(this.getSheetData([json]), this.fileName ?? `${dayjs().format('YYYYMMDDHHmmss')}.xlsx`);
    },
    getSheetData(data) {
      this.clearWorkbook();
      data.forEach((el, index) => {
        const sheetName = `${this.workSheet}${index + 1}`;
        this.workbook.SheetNames.push(sheetName);
        this.workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(el);
      });
      return XLSX.write(this.workbook, this.wbopts);
    },
    async export(data, filename) {
      if (!data) {
        return this.$emit('error');
      }
      let blob = this.sheetToBlob(data);
      if (isFunction(this.beforeFinish)) {
        await this.beforeFinish();
      }
      download(blob, filename);
      this.$emit('success');
    },
    getProcessedJson(data, header) {
      let keys = this.getKeys(data, header);
      let newData = [];
      data.forEach((item) => {
        let newItem = {};
        for (let label in keys) {
          let property = keys[label];
          newItem[label] = getCellValue(item, property);
        }
        newData.push(newItem);
      });
      return newData;
    },
    getKeys(data, header) {
      if (header) {
        return header;
      }
      let keys = {};
      for (let key in data[0]) {
        keys[key] = key;
      }
      return keys;
    },
    clearWorkbook() {
      this.workbook.SheetNames = [];
      this.workbook.Sheets = {};
    },
    sheetToBlob(data) {
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
      }
      return new Blob([s2ab(data)], { type: 'application/octet-stream' }); // 字符串转 ArrayBuffer
    },
    // 对外公开的方法
    DO_EXPORT(): void {
      this.generate();
    },
  },
  render(): JSXNode {
    return <i class="iconfont icon-download" />;
  },
});
