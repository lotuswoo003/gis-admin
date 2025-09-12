import { Menus } from '@/types/menu';

export const menuData: Menus[] = [
  {
    id: '1',
    title: '系统管理',
    index: '1',
    icon: 'HomeFilled',
    children: [
      { id: '11', pid: '1', index: '/system-user', title: '用户管理' },
      { id: '12', pid: '1', index: '/system-role', title: '角色管理' },
      { id: '13', pid: '1', index: '/system-menu', title: '菜单管理' },
      { id: '14', pid: '1', index: '/system-org', title: '组织管理' },
      { id: '16', pid: '1', index: '/system-project', title: '项目管理' },
      { id: '15', pid: '1', index: '/system-dict', title: '字典管理' },
      { id: '17', pid: '1', index: '/system-permission-package', title: '权限包管理' },
      { id: '18', pid: '1', index: '/system-enterprise-identity', title: '企业身份管理' },
    ],
  },
  {
    id: '2',
    title: '数据管理',
    index: '2',
    icon: 'Collection',
    children: [
      { id: '21', pid: '2', index: '/data-craft', title: '智能工艺' },
      { id: '22', pid: '2', index: '/data-rjc', title: '人机协同' },
      { id: '291', pid: '2', index: '/security-check', title: '安全管理' },
      { id: '25', pid: '2', index: '/data-scheme', title: '计划方案' },
    ],
  },
];

