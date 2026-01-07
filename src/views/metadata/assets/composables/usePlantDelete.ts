/**
 * 植物删除逻辑 Composable
 * @description 负责植物删除（单个和批量）的逻辑
 */

import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { plantApi } from '@/api/metadata/plant'
import type {
  DeleteConfirmState,
  PlantBasicInfoListResponse,
  PlantListState
} from '@/types/metadata/plant'

/**
 * 植物删除逻辑
 * @param onSuccess 成功回调（刷新列表）
 * @param listState 列表状态（用于获取选中的 ID 和清空选中）
 */
export function usePlantDelete(onSuccess: () => void, listState: PlantListState) {
  // 删除确认状态
  const deleteState = reactive<DeleteConfirmState>({
    visible: false,
    loading: false,
    deleteIds: [],
    deleteType: 'single'
  })

  /**
   * 单个删除
   * @param row 要删除的行数据
   */
  const handleDelete = (row: PlantBasicInfoListResponse): void => {
    deleteState.deleteType = 'single'
    deleteState.deleteIds = [row.id]
    deleteState.visible = true
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = (): void => {
    if (listState.selectedIds.length === 0) {
      ElMessage.warning('请至少选择一条记录')
      return
    }

    deleteState.deleteType = 'batch'
    deleteState.deleteIds = listState.selectedIds
    deleteState.visible = true
  }

  /**
   * 确认删除
   */
  const handleDeleteConfirm = async (): Promise<void> => {
    deleteState.loading = true

    try {
      let res

      if (deleteState.deleteType === 'single') {
        // 单个删除
        res = await plantApi.delete({ id: deleteState.deleteIds[0] })
      } else {
        // 批量删除
        res = await plantApi.deleteBatch({ ids: deleteState.deleteIds })
      }

      if (res.code === 0) {
        ElMessage.success('删除成功')
        deleteState.visible = false
        listState.selectedIds = [] // 清空选中
        onSuccess() // 刷新列表
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      const errorMessage = error instanceof Error ? error.message : '删除失败，请稍后重试'
      ElMessage.error(errorMessage)
    } finally {
      deleteState.loading = false
    }
  }

  /**
   * 取消删除
   */
  const handleDeleteCancel = (): void => {
    deleteState.visible = false
  }

  return {
    deleteState,
    handleDelete,
    handleBatchDelete,
    handleDeleteConfirm,
    handleDeleteCancel
  }
}
