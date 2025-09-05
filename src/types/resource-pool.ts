export interface GisResourcePool {
  id?: string;
  name?: string;
  organizationId?: string;
  polygon?: string;
  level?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ResourcePoolPageRequest {
  page: number;
  rows: number;
  name?: string;
  organizationId?: string;
}

export interface PageResultGisResourcePool {
  total: number;
  records: GisResourcePool[];
}

export interface GisResourcePoolSyncRequest {
  lotId?: string;
  idList: string[];
}

