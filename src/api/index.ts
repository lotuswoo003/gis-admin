import request from '../utils/request';
import type { UserPageRequest, UserPageResult } from '../types/user';

export const fetchData = () => {
    return request<{ list: any[]; pageTotal: number }>({
        url: './mock/table.json',
        method: 'get'
    });
};

export const fetchUserData = (data: UserPageRequest) => {
    return request<UserPageResult>({
        url: 'sys/user/pageAll',
        method: 'post',
        data,
    });
};
