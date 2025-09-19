import { Menus } from '@/types/menu';

export const menuData: Menus[] = [
  {
    id: '1',
    title: '绯荤粺绠＄悊',
    index: '1',
    icon: 'HomeFilled',
    children: [
      { id: '11', pid: '1', index: '/system-user', title: '鐢ㄦ埛绠＄悊' },
      { id: '12', pid: '1', index: '/system-role', title: '瑙掕壊绠＄悊' },
      { id: '13', pid: '1', index: '/system-menu', title: '鑿滃崟绠＄悊' },
      { id: '14', pid: '1', index: '/system-org', title: '缁勭粐绠＄悊' },
      { id: '16', pid: '1', index: '/system-project', title: '椤圭洰绠＄悊' },
      { id: '15', pid: '1', index: '/system-dict', title: '瀛楀吀绠＄悊' },
      { id: '17', pid: '1', index: '/system-permission-package', title: '鏉冮檺鍖呯鐞? },
      { id: '18', pid: '1', index: '/system-enterprise-identity', title: '浼佷笟韬唤绠＄悊' },
      { id: '19', pid: '1', index: '/system-scheduler', title: '定时任务' },
    ],
  },
  {
    id: '2',
    title: '鏁版嵁绠＄悊',
    index: '2',
    icon: 'Collection',
    children: [
      { id: '21', pid: '2', index: '/data-craft', title: '鏅鸿兘宸ヨ壓' },
      { id: '22', pid: '2', index: '/data-rjc', title: '浜烘満鍗忓悓' },
      { id: '291', pid: '2', index: '/security-check', title: '瀹夊叏绠＄悊' },
      { id: '25', pid: '2', index: '/data-scheme', title: '璁″垝鏂规' },
    ],
  },
];


