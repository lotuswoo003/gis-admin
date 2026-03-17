import request from '@/utils/request';
import type { SecurityCheck, SecurityCheckPageRequest, PageResultSecurityCheck, ConserveSecurityCheck } from '@/types/security-check';

export const fetchSecurityCheckPage = (data: SecurityCheckPageRequest) => {
  return request<PageResultSecurityCheck>({
    url: 'sys/securityCheck/page',
    method: 'post',
    data,
  });
};

export const getSecurityCheck = (id: string) => {
  return request<SecurityCheck>({
    url: `sys/securityCheck/get/${id}`,
    method: 'post',
  });
};

export const createSecurityCheck = (data: SecurityCheck) => {
  return request<string>({
    url: 'sys/securityCheck/create',
    method: 'post',
    data,
  });
};

export const updateSecurityCheck = (data: SecurityCheck) => {
  return request<boolean>({
    url: 'sys/securityCheck/update',
    method: 'post',
    data,
  });
};

export const deleteSecurityCheck = (id: string) => {
  return request<boolean>({
    url: `sys/securityCheck/delete/${id}`,
    method: 'post',
  });
};

export const fetchConserveSecurityCheckList = (data?: Partial<ConserveSecurityCheck>) => {
  return request<ConserveSecurityCheck[]>({
    url: 'sys/conserveSecurityCheck/list',
    method: 'post',
    data,
  });
};
