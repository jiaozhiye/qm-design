/*
 * @Author: 焦质晔
 * @Date: 2021-03-17 13:17:30
 * @Last Modified by:   焦质晔
 * @Last Modified time: 2021-03-17 13:17:30
 */
export default [
  {
    name: '更新日志',
    path: '/changelog',
  },
  {
    name: '开发指南',
    children: [
      {
        path: '/installation',
        name: '安装',
      },
      {
        path: '/quickstart',
        name: '快速上手',
      },
      {
        path: '/i18n',
        name: '国际化',
      },
    ],
  },
  {
    name: '组件',
    children: [
      {
        path: '/button',
        title: 'Button 按钮',
      },
    ],
  },
];
