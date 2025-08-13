import request from '../utils/request';
import type { PostalCodeListResponse } from '@/types/postal-code';

export interface PostalCodeParams {
    level: number;
    parentId: number;
}

export const fetchPostalCodeList = (data: PostalCodeParams) => {
    return request<PostalCodeListResponse>({
        url: '/postal-code/list',
        method: 'post',
        data,
    });
};
