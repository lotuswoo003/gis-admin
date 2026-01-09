/**
 * 植物基础信息 API
 * @description 植物信息的增删改查接口
 */

import request from '@/utils/request'
import type {
  PageResult,
  PlantBasicInfoListResponse,
  PlantPageRequest,
  PlantInsertRequest,
  PlantUpdateRequest,
  PlantDeleteRequest,
  PlantBatchDeleteRequest,
  PlantApproveRequest,
  PlantBatchApproveRequest,
  PlantTag,
  PlantTagInsertRequest
} from '@/types/metadata/plant'

/**
 * 分页查询植物列表
 * @param params 分页查询参数
 * @returns 分页结果
 */
export const selectPage = (params: PlantPageRequest) => {
  return request<PageResult<PlantBasicInfoListResponse>>({
    url: '/sys/plant-basic-info/select-page',
    method: 'post',
    data: params
  })
}

/**
 * 根据 ID 查询植物详情
 * @param id 植物 ID
 * @returns 植物详情
 */
export const selectById = (id: string) => {
  return request<PlantBasicInfoListResponse>({
    url: '/sys/plant-basic-info/select-by-id',
    method: 'post',
    data: { id }
  })
}

/**
 * 新增植物
 * @param data 新增植物数据
 * @returns 新增成功的植物 ID
 */
export const insert = (data: PlantInsertRequest) => {
  return request<string>({
    url: '/sys/plant-basic-info/insert',
    method: 'post',
    data
  })
}

/**
 * 更新植物
 * @param data 更新植物数据
 * @returns 更新影响的行数
 */
export const update = (data: PlantUpdateRequest) => {
  return request<number>({
    url: '/sys/plant-basic-info/update',
    method: 'post',
    data
  })
}

/**
 * 删除植物（单个）
 * @param data 删除请求参数
 * @returns 删除影响的行数
 */
export const deletePlant = (data: PlantDeleteRequest) => {
  return request<number>({
    url: '/sys/plant-basic-info/delete',
    method: 'post',
    data
  })
}

/**
 * 批量删除植物
 * @param data 批量删除请求参数
 * @returns 删除影响的行数
 */
export const deleteBatch = (data: PlantBatchDeleteRequest) => {
  return request<number>({
    url: '/sys/plant-basic-info/delete-batch',
    method: 'post',
    data
  })
}

/**
 * 查询常见植物列表
 * @param params 分页查询参数（会自动过滤 commonFlag=1）
 * @returns 分页结果
 */
export const selectCommon = (params: PlantPageRequest) => {
  return request<PageResult<PlantBasicInfoListResponse>>({
    url: '/sys/plant-basic-info/select-common',
    method: 'post',
    data: params
  })
}

/**
 * 单个审批植物
 * @param data 审批请求参数
 * @returns 影响的行数
 */
export const approve = (data: PlantApproveRequest) => {
  return request<number>({
    url: '/sys/plant-basic-info/approve',
    method: 'post',
    data
  })
}

/**
 * 批量审批植物
 * @param data 批量审批请求参数
 * @returns 影响的行数
 */
export const batchApprove = (data: PlantBatchApproveRequest) => {
  return request<number>({
    url: '/sys/plant-basic-info/batch-approve',
    method: 'post',
    data
  })
}

/**
 * 获取所有标签列表
 * @returns 标签列表
 */
export const getAllTags = () => {
  return request<PlantTag[]>({
    url: '/sys/plant-tag/select-list',
    method: 'post'
  })
}

/**
 * 新增标签
 * @param data 新增标签请求参数
 * @returns 新增成功的标签 ID
 */
export const addTag = (data: PlantTagInsertRequest) => {
  return request<string>({
    url: '/sys/plant-tag/insert',
    method: 'post',
    data
  })
}

/**
 * 植物信息 API 对象
 */
export const plantApi = {
  selectPage,
  selectById,
  insert,
  update,
  delete: deletePlant,
  deleteBatch,
  selectCommon,
  approve,
  batchApprove,
  getAllTags,
  addTag
}
