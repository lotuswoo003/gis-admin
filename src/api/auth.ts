import request from '@/utils/request';
import MD5 from 'crypto-js/md5';

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
  const payload: LoginPasswordRequest = {
    account: data.account,
    password: MD5(data.password).toString(),
  };
  return request<Token>({
    url: 'sys/login/password',
    method: 'post',
    data: payload,
  });
};
