import request from '@/utils/request';
import type { Conserve, ConservePageRequest } from '@/types/conserve';

export const fetchConservePage = (data: ConservePageRequest) => {
  return request<{ total: number; list?: Conserve[]; records?: Conserve[] }>({
    url: 'sys/conserve/page',
    method: 'post',
    data,
  });
};

export const getConserve = (id: string) => {
  return request<Conserve>({
    url: `sys/conserve/get/${id}`,
    method: 'post',
  });
};

export const createConserve = (data: Conserve) => {
  return request<string>({
    url: 'sys/conserve/create',
    method: 'post',
    data,
  });
};

export const updateConserve = (data: Conserve) => {
  return request<boolean>({
    url: 'sys/conserve/update',
    method: 'post',
    data,
  });
};

export const deleteConserve = (id: string) => {
  return request<boolean>({
    url: `sys/conserve/delete/${id}`,
    method: 'post',
  });
};
