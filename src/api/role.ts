import request from '@/utils/request';
import type { Role, RoleCreateRequest, RoleUpdateRequest, RolePageRequest } from '@/types/role';

export const getRole = (id: string) => {
    return request<Role>({
        url: `sys/roles/get/${id}`,
        method: 'post',
    });
};

export const listRoles = (data: Record<string, any>) => {
    return request<Role[]>({
        url: 'sys/roles/list',
        method: 'post',
        data,
    });
};

export const fetchRolePage = (data: RolePageRequest) => {
    return request<{ total: number; records: Role[] }>({
        url: 'sys/roles/page',
        method: 'post',
        data,
    });
};

export const createRole = (data: RoleCreateRequest) => {
    return request<boolean>({
        url: 'sys/roles/create',
        method: 'post',
        data,
    });
};

export const updateRole = (data: RoleUpdateRequest) => {
    return request<boolean>({
        url: 'sys/roles/update',
        method: 'post',
        data,
    });
};

export const deleteRole = (id: string) => {
    return request<boolean>({
        url: `sys/roles/delete/${id}`,
        method: 'post',
    });
};

export const assignRole = (userId: string, data: { roleId: string }) => {
    return request<boolean>({
        url: `sys/roles/assign/${userId}`,
        method: 'post',
        data,
    });
};

export const getRolePermissionIds = (roleId: string) => {
    return request<string[]>({
        url: `sys/roles/permission/get/${roleId}`,
        method: 'post',
    });
};

export const updateRolePermissions = (roleId: string, data: { permissionIds: string[] }) => {
    return request<boolean>({
        url: `sys/roles/permission/update/${roleId}`,
        method: 'post',
        data,
    });
};
