/**
 * 植物标签管理 Composable
 * @description 负责标签的加载、筛选、新增等功能
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { plantApi } from '@/api/metadata/plant'
import type { PlantTag } from '@/types/metadata/plant'

/**
 * 植物标签管理逻辑
 */
export function usePlantTags() {
  // 所有标签列表
  const allTags = ref<PlantTag[]>([])

  // 已选中的标签
  const selectedTags = ref<string[]>([])

  // 新增标签对话框可见性
  const addTagDialogVisible = ref(false)

  // 新增标签加载中
  const addTagLoading = ref(false)

  /**
   * 加载所有标签
   */
  const loadTags = async (): Promise<void> => {
    try {
      const res = await plantApi.getAllTags()

      if (res.code === 0) {
        allTags.value = res.data
      } else {
        ElMessage.error(res.message || '加载标签失败')
      }
    } catch (error) {
      console.error('加载标签失败:', error)
      ElMessage.error('加载标签失败，请稍后重试')
    }
  }

  /**
   * 切换标签选中状态
   * @param tagName 标签名称
   */
  const toggleTag = (tagName: string): void => {
    const index = selectedTags.value.indexOf(tagName)
    if (index > -1) {
      // 已选中，取消选中
      selectedTags.value.splice(index, 1)
    } else {
      // 未选中，添加选中
      selectedTags.value.push(tagName)
    }
  }

  /**
   * 打开新增标签对话框
   */
  const handleAddTagClick = (): void => {
    addTagDialogVisible.value = true
  }

  /**
   * 提交新增标签
   * @param tagName 标签名称
   */
  const handleAddTagSubmit = async (tagName: string): Promise<void> => {
    addTagLoading.value = true

    try {
      const res = await plantApi.addTag(tagName)

      if (res.code === 0) {
        ElMessage.success('标签添加成功')
        addTagDialogVisible.value = false
        // 重新加载标签列表
        await loadTags()
      } else {
        ElMessage.error(res.message || '添加标签失败')
      }
    } catch (error) {
      console.error('添加标签失败:', error)
      const errorMessage = error instanceof Error ? error.message : '添加标签失败，请稍后重试'
      ElMessage.error(errorMessage)
    } finally {
      addTagLoading.value = false
    }
  }

  /**
   * 清空标签筛选
   */
  const clearTagFilter = (): void => {
    selectedTags.value = []
  }

  return {
    allTags,
    selectedTags,
    addTagDialogVisible,
    addTagLoading,
    loadTags,
    toggleTag,
    handleAddTagClick,
    handleAddTagSubmit,
    clearTagFilter
  }
}
