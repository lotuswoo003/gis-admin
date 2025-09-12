import request from '@/utils/request';
import type {
  PermissionPackage,
  PermissionPackageCreateRequest,
  PermissionPackageUpdateRequest,
} from '@/types/permission-package';

export const listPermissionPackages = async () => {
  try {
    return await request<PermissionPackage[]>({
      url: 'sys/permissionPackage/list',
      method: 'post',
    });
  } catch (err) {
    // 某些环境该接口可能为 GET，实现降级以兼容 UAT 老版本
    return await request<PermissionPackage[]>({
      url: 'sys/permissionPackage/list',
      method: 'get',
    });
  }
};

export const getPermissionPackage = (id: string) => {
  return request<PermissionPackage>({
    url: `sys/permissionPackage/get/${id}`,
    method: 'post',
  });
};

export const createPermissionPackage = (data: PermissionPackageCreateRequest) => {
  return request<string>({
    url: 'sys/permissionPackage/create',
    method: 'post',
    data,
  });
};

export const updatePermissionPackage = (data: PermissionPackageUpdateRequest) => {
  return request<boolean>({
    url: 'sys/permissionPackage/update',
    method: 'post',
    data,
  });
};

export const deletePermissionPackage = (id: string) => {
  return request<boolean>({
    url: `sys/permissionPackage/delete/${id}`,
    method: 'post',
  });
};

// 下面两个接口按照角色权限接口模式实现，后端需提供对应 API
// 绑定权限到权限包（来自 sys-api.yaml -> /permissionPackage/bind/permissions）
export const bindPermissionPackagePermissions = (data: { packageId: string; permissionIds: string[] }) => {
  return request<boolean>({
    url: 'sys/permissionPackage/bind/permissions',
    method: 'post',
    data,
  });
};

// 列出指定组织已绑定的权限包
export const listPermissionPackagesByOrg = (organizationId: string) => {
  return request<PermissionPackage[]>({
    url: `sys/permissionPackage/list/byOrg/${organizationId}`,
    method: 'post',
  });
};

// 绑定权限包到组织
export const bindPackagesToOrganization = (data: { organizationId: string; packageIds: string[] }) => {
  return request<boolean>({
    url: 'sys/permissionPackage/bind/org',
    method: 'post',
    data,
  });
};

// 按组织类型列出已绑定的权限包
export const listPermissionPackagesByOrgType = (organizationType: string) => {
  return request<PermissionPackage[]>({
    url: `sys/permissionPackage/list/byOrgType/${organizationType}`,
    method: 'post',
  });
};

// 绑定权限包到组织类型
export const bindPackagesToOrganizationType = (data: { organizationType: string; packageIds: string[] }) => {
  return request<boolean>({
    url: 'sys/permissionPackage/bind/orgType',
    method: 'post',
    data,
  });
};
