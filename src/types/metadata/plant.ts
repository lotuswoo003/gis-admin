/**
 * 植物基础信息相关类型定义
 * @description 包含植物信息、分类、API 请求/响应等所有类型
 */

/** 植物基础信息 - 对应后端 PlantBasicInfoResponse */
export interface PlantBasicInfo {
  /** 主键 ID (VARCHAR) */
  id: string
  /** 植物名称 */
  name: string
  /** 植物分类 ID (VARCHAR) */
  categoryId: string
  /** 分类名称（冗余字段，用于显示） */
  categoryName?: string
  /** 是否常见植物 (0=否, 1=是) */
  commonFlag: number
  /** 中国植物志编码 */
  chinaCode?: string
  /** 中文学名 */
  chinaScientificName?: string
  /** 拉丁学名 */
  latinScientificName?: string
  /** 拉丁学名（已废弃，使用 latinScientificName） */
  latinName?: string
  /** 英文名 */
  englishName?: string
  /** 别名 */
  alias?: string

  // 生物学分类字段
  /** 界 */
  plantae?: string
  /** 门 */
  phyta?: string
  /** 纲 */
  subclass?: string
  /** 目 */
  subject?: string
  /** 科 */
  family?: string
  /** 亚科 */
  subfamily?: string
  /** 族 */
  clan?: string
  /** 属 */
  category?: string
  /** 种 */
  kind?: string

  /** 标签列表 */
  tags?: string[]
  /** 数据来源 */
  source?: string
  /** 审核状态 (PENDING=待审核, APPROVED=已审核, REJECTED=已拒绝) */
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  /** 组织 ID (VARCHAR) */
  organizationId?: string
  /** 创建时间（时间戳） */
  createdAt?: number
  /** 更新时间（时间戳） */
  updatedAt?: number
  /** 创建人 */
  createdBy?: string
  /** 更新人 */
  updatedBy?: string
  /** 软删除时间 */
  deletedAt?: string | null
}

/** 植物分类信息 */
export interface PlantCategory {
  /** 分类 ID */
  id: string
  /** 分类名称 */
  categoryName: string
  /** 父级 ID */
  parentId?: string | null
  /** 层级 (1,2,3) */
  level: number
  /** 排序号 */
  orderNum?: number
  /** 子分类列表 */
  children?: PlantCategory[]
  /** Element Plus TreeSelect 需要的 label 字段 */
  label?: string
  /** Element Plus TreeSelect 需要的 value 字段 */
  value?: string
}

/** 分页查询请求参数 */
export interface PlantPageRequest {
  /** 页码 (从1开始) */
  page: number
  /** 每页条数 */
  rows: number
  /** 植物名称（模糊搜索） */
  name?: string
  /** 分类 ID */
  categoryId?: string
  /** 是否常见植物 (0/1) */
  commonFlag?: number
  /** 标签筛选（标签列表，满足任意一个标签即可） */
  tags?: string[]
  /** 组织 ID - 从用户上下文获取，前端不可修改 */
  organizationId?: string
  /** 排序字段 */
  sortBy?: 'createdAt' | 'updatedAt' | 'name'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/** 分页查询响应 */
export interface PageResult<T> {
  /** 总记录数 */
  total: number
  /** 当前页数据列表 */
  rows: T[]
}

/** 列表响应项 - 包含分类名称 */
export interface PlantBasicInfoListResponse extends PlantBasicInfo {
  /** 分类名称（从 plant_category 表关联查询） */
  categoryName: string
}

/** 新增植物请求参数 */
export interface PlantInsertRequest {
  /** 植物名称 (必填) */
  name: string
  /** 分类 ID (必填) */
  categoryId: string
  /** 是否常见植物 */
  commonFlag?: number
  /** 中国植物志编码 */
  chinaCode?: string
  /** 中文学名 */
  chinaScientificName?: string
  /** 拉丁学名 */
  latinScientificName?: string
  /** 拉丁学名（已废弃，使用 latinScientificName） */
  latinName?: string
  /** 英文名 */
  englishName?: string
  /** 别名 */
  alias?: string
  /** 生物学分类字段 */
  plantae?: string
  phyta?: string
  subclass?: string
  subject?: string
  family?: string
  subfamily?: string
  clan?: string
  category?: string
  kind?: string
  /** 数据来源 */
  source?: string
  /** 审核状态 */
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  /** 组织 ID - 从用户上下文自动填充 */
  organizationId?: string
}

/** 更新植物请求参数 */
export interface PlantUpdateRequest extends PlantInsertRequest {
  /** 主键 ID (必填) */
  id: string
}

/** 删除植物请求参数 */
export interface PlantDeleteRequest {
  /** 主键 ID (必填) */
  id: string
}

/** 批量删除请求参数 */
export interface PlantBatchDeleteRequest {
  /** ID 列表 (必填) */
  ids: string[]
}

/** Element Plus 表单验证规则类型 */
export interface FormItemRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: unknown, value: unknown, callback: (error?: Error) => void) => void
}

/** 表单验证规则 */
export interface PlantFormRules {
  name: FormItemRule[]
  categoryId: FormItemRule[]
  latinName?: FormItemRule[]
  englishName?: FormItemRule[]
  chinaCode?: FormItemRule[]
  alias?: FormItemRule[]
}

/** 列表查询状态 */
export interface PlantListState {
  /** 列表数据 */
  list: PlantBasicInfoListResponse[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  rows: number
  /** 加载中 */
  loading: boolean
  /** 搜索关键字 */
  searchName: string
  /** 分类筛选 */
  filterCategoryId: string
  /** 常见植物筛选 (undefined=全部, 0=否, 1=是) */
  filterCommonFlag?: number
  /** 标签筛选（选中的标签列表） */
  filterTags: string[]
  /** 已选中的行 */
  selectedIds: string[]
}

/** 植物标签 */
export interface PlantTag {
  /** 主键ID */
  id: string
  /** 标签名称 */
  tagName: string
  /** 状态：ENABLED-启用，DISABLED-禁用 */
  status?: string
  /** 备注信息 */
  remark?: string
  /** 创建时间 */
  createdAt?: number
  /** 更新时间 */
  updatedAt?: number
  /** 创建人ID */
  createdBy?: string
  /** 更新人ID */
  updatedBy?: string
}

/** 新增标签请求 */
export interface PlantTagInsertRequest {
  /** 标签名称（必填） */
  tagName: string
  /** 备注信息（可选） */
  remark?: string
  /** 创建时绑定的植物ID列表（可选） */
  plantIds?: string[]
}

/** 批量审批请求参数 */
export interface PlantBatchApproveRequest {
  /** ID 列表 (必填) */
  ids: string[]
  /** 审批状态 (APPROVED=通过, REJECTED=拒绝) */
  status: 'APPROVED' | 'REJECTED'
  /** 审批意见（可选） */
  remark?: string
}

/** 单个审批请求参数 */
export interface PlantApproveRequest {
  /** 主键 ID (必填) */
  id: string
  /** 审批状态 (APPROVED=通过, REJECTED=拒绝) */
  status: 'APPROVED' | 'REJECTED'
  /** 审批意见（可选） */
  remark?: string
}

/** 表单对话框状态 */
export interface PlantFormState {
  /** 对话框可见性 */
  visible: boolean
  /** 表单模式 ("add" | "edit") */
  mode: 'add' | 'edit'
  /** 表单数据 */
  formData: PlantInsertRequest | PlantUpdateRequest
  /** 表单加载中 */
  loading: boolean
}

/** 删除确认对话框状态 */
export interface DeleteConfirmState {
  /** 对话框可见性 */
  visible: boolean
  /** 删除中 */
  loading: boolean
  /** 待删除的 ID 列表 */
  deleteIds: string[]
  /** 删除类型 ("single" | "batch") */
  deleteType: 'single' | 'batch'
}

/** 分类查询请求参数 */
export interface PlantCategoryListRequest {
  /** 组织 ID */
  organizationId?: string
}
