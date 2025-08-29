import request from '@/utils/request';
import type { OrganizationPageQuery, OrganizationSave, OrganizationUpdate, Organization } from '@/types/org';

export const fetchOrganizationPage = (data: OrganizationPageQuery) => {
    return request<{ total: number; records: Organization[] }>({
        url: 'sys/organization/page',
        method: 'post',
        data,
    });
};

export const getOrganization = (id: number) => {
    return request<Organization>({
        url: `sys/organization/get/${id}`,
        method: 'get',
    });
};

export const saveOrganization = (data: OrganizationSave) => {
    return request<boolean>({
        url: 'sys/organization/save',
        method: 'post',
        data,
    });
};

export const updateOrganization = (data: OrganizationUpdate) => {
    return request<boolean>({
        url: 'sys/organization/update',
        method: 'post',
        data,
    });
};
