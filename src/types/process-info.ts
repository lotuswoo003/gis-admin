export interface ProcessInfo {
  id?: string;
  question?: string;
  type?: string; // human/machine/material 或后端定义的字符串
  processes?: string;
  human?: string;
  tool?: string;
  material?: string;
  organizationId?: string;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface ProcessInfoPageRequest {
  page: number;
  rows: number;
  type?: string;
  question?: string;
  organizationId?: string;
}

export interface PageResultProcessInfo {
  total: number;
  records: ProcessInfo[];
}

