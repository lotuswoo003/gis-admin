import request from '@/utils/request';
import type { PermissionCreateRequest, PermissionUpdateRequest } from '@/types/permission';

export const getPermission = (id: string) => {
    return request({
        url: `/permission/get/${id}`,
        method: 'post',
    });
};

export const listPermissions = (data: Record<string, any>) => {
    return request({
        url: '/permission/list',
        method: 'post',
        data,
    });
};

export const createPermission = (data: PermissionCreateRequest) => {
    return request({
        url: '/permission/create',
        method: 'post',
        data,
    });
};

export const updatePermission = (data: PermissionUpdateRequest) => {
    return request({
        url: '/permission/update',
        method: 'post',
        data,
    });
};

export const deletePermission = (id: string) => {
    return request({
        url: `/permission/delete/${id}`,
        method: 'post',
    });
};

export const getPermissionChildren = (data: { parentId: string; type: string }) => {
    return request({
        url: '/permission/children',
        method: 'post',
        data,
    });
};

export const queryPermissionByTreePath = (data: { treePath: string }) => {
    return request({
        url: '/permission/treePath',
        method: 'post',
        data,
    });
};
