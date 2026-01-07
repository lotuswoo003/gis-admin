/**
 * 植物分类加载逻辑 Composable
 * @description 负责加载和管理植物分类数据
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { plantCategoryApi } from '@/api/metadata/plantCategory'
import { useUserStore } from '@/store/user'
import type { PlantCategory } from '@/types/metadata/plant'

/**
 * 植物分类逻辑
 */
export function usePlantCategory() {
  const userStore = useUserStore()

  // 分类列表
  const categoryList = ref<PlantCategory[]>([])

  // 加载中
  const loading = ref(false)

  /**
   * 加载分类列表
   */
  const loadCategories = async (): Promise<void> => {
    loading.value = true

    try {
      const res = await plantCategoryApi.selectList({
        organizationId: userStore.currentOrganizationId // 可选，管理端可能没有
      })

      if (res.code === 0) {
        // 转换数据格式，添加 Element Plus TreeSelect 需要的字段
        categoryList.value = convertToTreeSelectFormat(res.data)
      } else {
        ElMessage.error(res.message || '加载分类失败')
      }
    } catch (error) {
      console.error('加载植物分类失败:', error)
      const errorMessage = error instanceof Error ? error.message : '加载分类失败，请刷新页面重试'
      ElMessage.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  /**
   * 转换分类数据为 TreeSelect 格式
   * @param categories 原始分类数据
   * @returns 转换后的分类数据
   */
  const convertToTreeSelectFormat = (categories: PlantCategory[]): PlantCategory[] => {
    return categories.map(category => ({
      ...category,
      label: category.name,
      value: category.id,
      children: category.children ? convertToTreeSelectFormat(category.children) : undefined
    }))
  }

  return {
    categoryList,
    loading,
    loadCategories
  }
}
