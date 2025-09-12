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

export const listPermissions = async (data: Record<string, any>) => {
    try {
        return await request<Permission[]>({
            url: 'sys/permission/list',
            method: 'post',
            data,
        });
    } catch (e) {
        // 兼容部分环境仅支持 GET 的情况
        return await request<Permission[]>({
            url: 'sys/permission/list',
            method: 'get',
            params: data,
        });
    }
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

export const getPermissionChildren = async (data: { parentId: string; type: string }) => {
    try {
        return await request<Permission[]>({
            url: 'sys/permission/children',
            method: 'post',
            data,
        });
    } catch (e) {
        return await request<Permission[]>({
            url: 'sys/permission/children',
            method: 'get',
            params: data,
        });
    }
};

export const queryPermissionByTreePath = (data: { treePath: string }) => {
    return request<Permission[]>({
        url: 'sys/permission/treePath',
        method: 'post',
        data,
    });
};

export const getPermissionTree = async (data: Record<string, any> = {}) => {
    try {
        return await request<Permission[]>({
            url: 'sys/permission/tree',
            method: 'post',
            data: data ?? {},
        });
    } catch (e) {
        return await request<Permission[]>({
            url: 'sys/permission/tree',
            method: 'get',
            params: data ?? {},
        });
    }
};
