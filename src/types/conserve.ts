export type ConserveMode = 'people' | 'machine' | 'material';

export interface Conserve {
  id?: string;
  code?: string;
  name?: string;
  mode?: ConserveMode | string;
  parentId?: number;
  organizationId?: number;
  dispalyOrder?: number;
  json?: string;
  versionId?: number;
  securityJson?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ConservePageRequest {
  page: number;
  rows: number;
  code?: string;
  name?: string;
  mode?: ConserveMode | string;
  parentId?: number;
  organizationId?: number;
  versionId?: number;
}
