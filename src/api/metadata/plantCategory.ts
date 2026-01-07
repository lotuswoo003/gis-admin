/**
 * 植物分类 API
 * @description 植物分类的查询接口
 */

import request from '@/utils/request'
import type {
  PlantCategory,
  PlantCategoryListRequest
} from '@/types/metadata/plant'

/**
 * 查询分类列表（树形结构）
 * @param params 查询参数
 * @returns 分类列表
 */
export const selectList = (params: PlantCategoryListRequest) => {
  return request<PlantCategory[]>({
    url: '/plant-category/select-list',
    method: 'post',
    data: params
  })
}

/**
 * 根据 ID 查询分类详情
 * @param id 分类 ID
 * @returns 分类详情
 */
export const selectById = (id: string) => {
  return request<PlantCategory>({
    url: '/plant-category/select-by-id',
    method: 'post',
    data: { id }
  })
}

/**
 * 植物分类 API 对象
 */
export const plantCategoryApi = {
  selectList,
  selectById
}
