import request from '@/utils/request';
import { DictType } from '@/types/dict';

// 获取字典类型列表
export const listDict = () => {
  return request<{ code: number; message: string; data: DictType[] }>({
    url: '/dict',
    method: 'get',
  });
};

// 根据ID获取字典类型详情
export const getDict = (id: string) => {
  return request<{ code: number; message: string; data: DictType }>({
    url: `/dict/${id}`,
    method: 'get',
  });
};

// 新增字典类型
export const createDict = (data: DictType) => {
  return request<{ code: number; message: string; data: boolean }>({
    url: '/dict',
    method: 'post',
    data,
  });
};

// 编辑字典类型
export const updateDict = (id: string, data: DictType) => {
  return request<{ code: number; message: string; data: boolean }>({
    url: `/dict/${id}`,
    method: 'put',
    data,
  });
};

// 删除字典类型
export const deleteDict = (id: string) => {
  return request<{ code: number; message: string; data: boolean }>({
    url: `/dict/${id}`,
    method: 'delete',
  });
};
