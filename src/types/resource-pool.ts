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
  name?: string;
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

/**
 * 资源池地块拆分条目
 */
export interface ResourcePoolSplitItem {
  /** 新地块名称（可选，默认继承原地块名称） */
  name?: string;
  /** 组织ID（可选，默认继承原地块组织ID） */
  organizationId?: string;
  /** 地块多边形 WKT（必填） */
  polygon: string;
  /** 地块级别（可选，默认继承原地块级别） */
  level?: string;
}

/**
 * 资源池地块拆分请求
 */
export interface ResourcePoolSplitRequest {
  /** 原地块ID（必填） */
  id: string;
  /** 拆分后的地块列表（必填） */
  items: ResourcePoolSplitItem[];
}

/**
 * 资源池地块合并请求
 */
export interface ResourcePoolMergeRequest {
  /** 待合并地块ID列表（必填） */
  ids: string[];
  /** 合并后的地块多边形 WKT（必填） */
  polygon: string;
  /** 合并后的地块名称（可选，默认继承第一个地块名称） */
  name?: string;
  /** 合并后的组织ID（可选，默认继承第一个地块组织ID） */
  organizationId?: string;
  /** 合并后的地块级别（可选，默认继承第一个地块级别） */
  level?: string;
}

