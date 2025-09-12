export interface PermissionPackage {
  id: string;
  name: string;
  code: string;
  // 后端模型包含此字段（字符串），用于简要描述或绑定编码
  permissionCode?: string;
  // 为了前端反显勾选，后端 get/{id} 可能额外返回权限ID列表
  permissionIds?: string[];
  // 兼容后端返回的完整权限对象列表
  permissions?: any[];
}

export interface PermissionPackageCreateRequest {
  name: string;
  code: string;
  permissionCode?: string;
}

export interface PermissionPackageUpdateRequest extends PermissionPackageCreateRequest {
  id: string;
}
