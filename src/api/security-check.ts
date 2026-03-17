import request from '@/utils/request';
import type { SecurityCheck, SecurityCheckPageRequest, PageResultSecurityCheck } from '@/types/security-check';

export const fetchSecurityCheckPage = (data: SecurityCheckPageRequest) => {
  return request<PageResultSecurityCheck>({
    url: 'sys/conserveSecurityCheck/page',
    method: 'post',
    data,
  });
};

export const getSecurityCheck = (id: string) => {
  return request<SecurityCheck>({
    url: `sys/conserveSecurityCheck/get/${id}`,
    method: 'post',
  });
};

export const createSecurityCheck = (data: SecurityCheck) => {
  return request<string>({
    url: 'sys/conserveSecurityCheck/create',
    method: 'post',
    data,
  });
};

export const updateSecurityCheck = (data: SecurityCheck) => {
  return request<boolean>({
    url: 'sys/conserveSecurityCheck/update',
    method: 'post',
    data,
  });
};

export const deleteSecurityCheck = (id: string) => {
  return request<boolean>({
    url: `sys/conserveSecurityCheck/delete/${id}`,
    method: 'post',
  });
};
