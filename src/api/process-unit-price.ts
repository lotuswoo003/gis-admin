import request from '@/utils/request';
import type { ProcessUnitPrice, ProcessUnitPricePageRequest } from '@/types/process-unit-price';

export const fetchProcessUnitPricePage = (data: ProcessUnitPricePageRequest) => {
  return request<{ total: number; records: ProcessUnitPrice[] }>({
    url: 'sys/processUnitPrice/page',
    method: 'post',
    data,
  });
};

export const getProcessUnitPrice = (id: string) => {
  return request<ProcessUnitPrice>({
    url: `sys/processUnitPrice/get/${id}`,
    method: 'post',
  });
};

export const createProcessUnitPrice = (data: ProcessUnitPrice) => {
  return request<string>({
    url: 'sys/processUnitPrice/create',
    method: 'post',
    data,
  });
};

export const updateProcessUnitPrice = (data: ProcessUnitPrice) => {
  return request<boolean>({
    url: 'sys/processUnitPrice/update',
    method: 'post',
    data,
  });
};

export const deleteProcessUnitPrice = (id: string) => {
  return request<boolean>({
    url: `sys/processUnitPrice/delete/${id}`,
    method: 'post',
  });
};

