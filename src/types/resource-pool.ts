/**
 * 资源池实体
 */
export interface GisResourcePool {
  /** 资源池ID */
  id?: string;
  /** 资源池名称 */
  name?: string;
  /** 组织ID */
  organizationId?: string;
  /** 多边形数据（GeoJSON格式） */
  polygon?: string;
  /** 级别 */
  level?: string;
  /** 创建时间 */
  createdAt?: number;
  /** 更新时间 */
  updatedAt?: number;
  /** 删除时间 */
  deletedAt?: number | null;
}

/**
 * 资源池创建请求
 */
export interface ResourcePoolCreateRequest {
  /** 资源池名称 */
  name: string;
  /** 组织ID */
  organizationId: string;
  /** 多边形数据（GeoJSON格式） */
  polygon: string;
  /** 级别 */
  level?: string;
}

/**
 * 资源池更新请求
 */
export interface ResourcePoolUpdateRequest {
  /** 资源池ID */
  id: string;
  /** 资源池名称 */
  name?: string;
  /** 组织ID */
  organizationId?: string;
  /** 多边形数据（GeoJSON格式） */
  polygon?: string;
  /** 级别 */
  level?: string;
}

/**
 * 资源池分页查询请求
 */
export interface ResourcePoolPageRequest {
  /** 页码，从1开始 */
  page: number;
  /** 每页条数 */
  rows: number;
  /** 资源池名称（模糊查询） */
  name?: string;
  /** 组织ID */
  organizationId?: string;
}

/**
 * 分页结果
 */
export interface PageResultGisResourcePool {
  /** 总记录数 */
  total: number;
  /** 资源池列表 */
  list: GisResourcePool[];
}

/**
 * 资源池同步请求
 */
export interface GisResourcePoolSyncRequest {
  /** 项目ID */
  projectId: string;
  /** 要同步的资源池ID列表 */
  idList: string[];
}

