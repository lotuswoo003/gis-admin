import request from '@/utils/request';
import type { GisResourcePool, ResourcePoolPageRequest, PageResultGisResourcePool, GisResourcePoolSyncRequest } from '@/types/resource-pool';

export const fetchResourcePoolPage = (data: ResourcePoolPageRequest) => {
  return request<PageResultGisResourcePool>({
    url: 'sys/resourcePool/page',
    method: 'post',
    data,
  });
};

export const deleteResourcePool = (id: string) => {
  return request<boolean>({
    url: `sys/resourcePool/delete/${id}`,
    method: 'post',
  });
};

export const getResourcePool = (id: string) => {
  return request<GisResourcePool>({
    url: `sys/resourcePool/get/${id}`,
    method: 'post',
  });
};

export const updateResourcePool = (data: GisResourcePool) => {
  return request<boolean>({
    url: 'sys/resourcePool/update',
    method: 'post',
    data,
  });
};

export const createResourcePool = (data: GisResourcePool) => {
  return request<string>({
    url: 'sys/resourcePool/create',
    method: 'post',
    data,
  });
};

export const syncResourcePool = (data: GisResourcePoolSyncRequest) => {
  return request<boolean>({
    url: 'sys/resourcePool/sync',
    method: 'post',
    data,
  });
};

export const importResourcePoolShp = (organizationId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<boolean>({
    url: `sys/resourcePool/importShp/${organizationId}`,
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

