import request from '../utils/request';

export const fetchData = () => {
    return request<{ list: any[]; pageTotal: number }>({
        url: './mock/table.json',
        method: 'get'
    });
};

export const fetchUserData = () => {
    return request<{ list: any[]; pageTotal: number }>({
        url: './mock/user.json',
        method: 'get'
    });
};

export const fetchRoleData = () => {
    return request<{ list: any[]; pageTotal: number }>({
        url: './mock/role.json',
        method: 'get'
    });
};
