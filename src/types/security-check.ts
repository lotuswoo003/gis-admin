export interface SecurityCheck {
  id?: string;
  code?: string;
  name?: string; // 安全检查项目
  mode?: string; // 类别 security_mode
  parentId?: string;
  imageList?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface SecurityCheckPageRequest {
  page: number;
  rows: number;
  name?: string;
  mode?: string;
  parentId?: string;
}

export interface PageResultSecurityCheck {
  total: number;
  list: SecurityCheck[];
}

export interface ConserveSecurityCheck {
  id?: string;
  code?: string;
  name?: string;
  mode?: string;
  parentId?: string;
}
