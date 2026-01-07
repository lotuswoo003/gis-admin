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
  PlantBatchDeleteRequest
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
 * 植物信息 API 对象
 */
export const plantApi = {
  selectPage,
  selectById,
  insert,
  update,
  delete: deletePlant,
  deleteBatch,
  selectCommon
}
