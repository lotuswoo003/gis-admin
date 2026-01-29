import request from '@/utils/request';
import type {
  GisResourcePool,
  ResourcePoolCreateRequest,
  ResourcePoolUpdateRequest,
  ResourcePoolPageRequest,
  PageResultGisResourcePool,
  GisResourcePoolSyncRequest
} from '@/types/resource-pool';

/**
 * 获取资源池详情
 * @param id 资源池ID
 */
export const getResourcePool = (id: string) => {
  return request<GisResourcePool>({
    url: `sys/resourcePool/get/${id}`,
    method: 'post',
  });
};

/**
 * 获取所有资源池列表（不分页）
 */
export const getResourcePoolList = () => {
  return request<GisResourcePool[]>({
    url: 'sys/resourcePool/list',
    method: 'post',
  });
};

/**
 * 创建资源池
 * @param data 创建请求参数
 * @returns 创建成功后返回资源池ID
 */
export const createResourcePool = (data: ResourcePoolCreateRequest) => {
  return request<string>({
    url: 'sys/resourcePool/create',
    method: 'post',
    data,
  });
};

/**
 * 更新资源池
 * @param data 更新请求参数
 */
export const updateResourcePool = (data: ResourcePoolUpdateRequest) => {
  return request<boolean>({
    url: 'sys/resourcePool/update',
    method: 'post',
    data,
  });
};

/**
 * 删除资源池（逻辑删除）
 * @param id 资源池ID
 */
export const deleteResourcePool = (id: string) => {
  return request<boolean>({
    url: `sys/resourcePool/delete/${id}`,
    method: 'post',
  });
};

/**
 * 分页查询资源池
 * @param data 分页查询参数
 */
export const fetchResourcePoolPage = (data: ResourcePoolPageRequest) => {
  return request<PageResultGisResourcePool>({
    url: 'sys/resourcePool/page',
    method: 'post',
    data,
  });
};

/**
 * 导入SHP文件
 * @param organizationId 组织ID
 * @param file SHP压缩包文件
 */
export const importResourcePoolShp = (organizationId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return request<void>({
    url: `sys/resourcePool/importShp/${organizationId}`,
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 同步资源池地块给项目
 * @param data 同步请求参数
 */
export const syncResourcePool = (data: GisResourcePoolSyncRequest) => {
  return request<void>({
    url: 'sys/resourcePool/sync',
    method: 'post',
    data,
  });
};

