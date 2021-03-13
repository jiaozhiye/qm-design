/*
 * @Author: 焦质晔
 * @Date: 2021-03-13 10:08:41
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-03-13 13:43:35
 */
import axios from '../fetch';

export const getTableData = (params) => axios.get(`/api/design/getTableData`, { params });

export const getSelectData = (params) => axios.get(`/api/design/getSelectData`, { params });

export const getTreeData = (params) => axios.get(`/api/design/getTreeData`, { params });
