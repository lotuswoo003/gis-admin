import request from '@/utils/request';
import type { ProcessInfo, ProcessInfoPageRequest } from '@/types/process-info';

export const fetchProcessInfoPage = (data: ProcessInfoPageRequest) => {
  return request<{ total: number; list: ProcessInfo[] }>({
    url: 'sys/processInfo/page',
    method: 'post',
    data,
  });
};

export const getProcessInfo = (id: string) => {
  return request<ProcessInfo>({
    url: `sys/processInfo/get/${id}`,
    method: 'post',
  });
};

export const createProcessInfo = (data: ProcessInfo) => {
  return request<string>({
    url: 'sys/processInfo/create',
    method: 'post',
    data,
  });
};

export const updateProcessInfo = (data: ProcessInfo) => {
  return request<boolean>({
    url: 'sys/processInfo/update',
    method: 'post',
    data,
  });
};

export const deleteProcessInfo = (id: string) => {
  return request<boolean>({
    url: `sys/processInfo/delete/${id}`,
    method: 'post',
  });
};

// Download Excel template for ProcessInfo import
export const downloadProcessInfoTemplate = () => {
  return request<Blob>({
    url: 'sys/processInfo/downloadTemplate',
    method: 'get',
    responseType: 'blob',
  });
};

// Import ProcessInfo list via Excel file
export const importProcessInfoExcel = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<any>({
    url: 'sys/processInfo/upload/import',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
