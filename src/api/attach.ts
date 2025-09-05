import request from '@/utils/request';

export interface UploadSelectRequest {
  dir: string;
  storageMode?: string;
}

export interface UploadSelectResponse {
  storage?: any;
  config: {
    accessid: string;
    host: string;
    policy: string;
    signature: string;
    expire: number;
    dir: string;
    // token?: string; // if backend provides STS token
  };
}

export const selectUpload = (data: UploadSelectRequest) => {
  return request<UploadSelectResponse>({
    url: 'sys/attach/upload-select',
    method: 'post',
    data,
  });
};
