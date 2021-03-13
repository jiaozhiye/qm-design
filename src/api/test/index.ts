/*
 * @Author: 焦质晔
 * @Date: 2021-03-13 10:08:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-13 10:09:57
 */
import axios from '../fetch';

export const getTableData = (params) => axios.get(`/api/design/getTableData`, { params });
