import request from '../utils/request';
import type { PostalCode } from '@/types/postal-code';

export interface PostalCodeParams {
    level: number;
    parentId: string;
}

export const fetchPostalCodeList = (data: PostalCodeParams) => {
    return request<PostalCode[]>({
        url: 'sys/postal-code/list',
        method: 'post',
        data,
    });
};
