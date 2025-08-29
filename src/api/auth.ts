import request from '@/utils/request';

export interface LoginPasswordRequest {
  account: string;
  password: string;
}

export interface Token {
  accessToken: string;
  refreshToken?: string;
  expireTime?: number;
}

export const loginByPassword = (data: LoginPasswordRequest) => {
  return request<Token>({
    url: '/login/password',
    method: 'post',
    data,
  });
};

