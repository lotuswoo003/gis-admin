/**
 * 植物审批功能 Composable
 * @description 负责单个审批和批量审批功能
 */

import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { plantApi } from '@/api/metadata/plant'
import type { PlantBasicInfoListResponse, PlantListState } from '@/types/metadata/plant'

/**
 * 植物审批逻辑
 * @param loadList 重新加载列表的函数
 * @param listState 列表状态
 */
export function usePlantApprove(
  loadList: () => Promise<void>,
  listState: PlantListState
) {
  // 审批加载中
  const approving = ref(false)

  /**
   * 单个审批（通过）
   * @param row 要审批的行数据
   */
  const handleApprove = async (row: PlantBasicInfoListResponse): Promise<void> => {
    try {
      await ElMessageBox.confirm(
        `确定要审核通过植物"${row.name}"吗？`,
        '审核确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      approving.value = true

      const res = await plantApi.approve({
        id: row.id,
        status: 'APPROVED'
      })

      if (res.code === 0) {
        ElMessage.success('审核成功')
        await loadList()
      } else {
        ElMessage.error(res.message || '审核失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('审批失败:', error)
        const errorMessage = error instanceof Error ? error.message : '审批失败，请稍后重试'
        ElMessage.error(errorMessage)
      }
    } finally {
      approving.value = false
    }
  }

  /**
   * 批量审批（通过）
   */
  const handleBatchApprove = async (): Promise<void> => {
    if (listState.selectedIds.length === 0) {
      ElMessage.warning('请选择要审批的植物')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要批量审核通过选中的 ${listState.selectedIds.length} 条植物吗？`,
        '批量审核确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      approving.value = true

      const res = await plantApi.batchApprove({
        ids: listState.selectedIds,
        status: 'APPROVED'
      })

      if (res.code === 0) {
        ElMessage.success(`批量审核成功，共审核 ${res.data} 条记录`)
        listState.selectedIds = [] // 清空选中
        await loadList()
      } else {
        ElMessage.error(res.message || '批量审核失败')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量审批失败:', error)
        const errorMessage = error instanceof Error ? error.message : '批量审批失败，请稍后重试'
        ElMessage.error(errorMessage)
      }
    } finally {
      approving.value = false
    }
  }

  /**
   * 单个驳回
   * @param row 要驳回的行数据
   */
  const handleReject = async (row: PlantBasicInfoListResponse): Promise<void> => {
    try {
      const { value: remark } = await ElMessageBox.prompt(
        `确定要驳回植物"${row.name}"吗？请填写驳回原因：`,
        '驳回确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '请输入驳回原因（可选）'
        }
      )

      approving.value = true

      const res = await plantApi.approve({
        id: row.id,
        status: 'REJECTED',
        remark
      })

      if (res.code === 0) {
        ElMessage.success('驳回成功')
        await loadList()
      } else {
        ElMessage.error(res.message || '驳回失败')
      }
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('驳回失败:', error)
        const errorMessage = error instanceof Error ? error.message : '驳回失败，请稍后重试'
        ElMessage.error(errorMessage)
      }
    } finally {
      approving.value = false
    }
  }

  return {
    approving,
    handleApprove,
    handleBatchApprove,
    handleReject
  }
}
