import request from '@/utils/request';
import type {
    PermissionCreateRequest,
    PermissionUpdateRequest,
    PermissionPageQuery,
    Permission
} from '@/types/permission';

export const getPermission = (id: string) => {
    return request<Permission>({
        url: `sys/permission/get/${id}`,
        method: 'post',
    });
};

export const listPermissions = (data: Record<string, any>) => {
    return request<Permission[]>({
        url: 'sys/permission/list',
        method: 'post',
        data,
    });
};

export const fetchPermissionPage = (data: PermissionPageQuery) => {
    return request<{ total: number; records: Permission[] }>({
        url: 'sys/permission/page',
        method: 'post',
        data,
    });
};

export const createPermission = (data: PermissionCreateRequest) => {
    return request<boolean>({
        url: 'sys/permission/create',
        method: 'post',
        data,
    });
};

export const updatePermission = (data: PermissionUpdateRequest) => {
    return request<boolean>({
        url: 'sys/permission/update',
        method: 'post',
        data,
    });
};

export const deletePermission = (id: string) => {
    return request<boolean>({
        url: `sys/permission/delete/${id}`,
        method: 'post',
    });
};

export const getPermissionChildren = (data: { parentId: string; type: string }) => {
    return request<Permission[]>({
        url: 'sys/permission/children',
        method: 'post',
        data,
    });
};

export const queryPermissionByTreePath = (data: { treePath: string }) => {
    return request<Permission[]>({
        url: 'sys/permission/treePath',
        method: 'post',
        data,
    });
};
