import request from '@/utils/request';
import type { OrganizationPageQuery, OrganizationSave, OrganizationUpdate } from '@/types/org';

export const fetchOrganizationPage = (data: OrganizationPageQuery) => {
    return request({
        url: '/organization/page',
        method: 'post',
        data,
    });
};

export const getOrganization = (id: number) => {
    return request({
        url: `/organization/get/${id}`,
        method: 'get',
    });
};

export const saveOrganization = (data: OrganizationSave) => {
    return request({
        url: '/organization/save',
        method: 'post',
        data,
    });
};

export const updateOrganization = (data: OrganizationUpdate) => {
    return request({
        url: '/organization/update',
        method: 'post',
        data,
    });
};
