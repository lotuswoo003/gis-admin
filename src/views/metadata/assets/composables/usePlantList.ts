/**
 * 植物列表逻辑 Composable
 * @description 负责植物列表的查询、搜索、分页、选择等功能
 */

import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { plantApi } from '@/api/metadata/plant'
import { useUserStore } from '@/store/user'
import type { PlantListState, PlantPageRequest } from '@/types/metadata/plant'

/**
 * 植物列表逻辑
 */
export function usePlantList() {
  const userStore = useUserStore()
  const router = useRouter()

  // 列表状态
  const listState = reactive<PlantListState>({
    list: [],
    total: 0,
    page: 1,
    rows: 10,
    loading: false,
    searchName: '',
    filterCategoryId: '',
    filterCommonFlag: undefined,
    selectedIds: []
  })

  /**
   * 加载列表
   */
  const loadList = async (): Promise<void> => {
    // 1. 检查 organizationId
    const organizationId = userStore.currentOrganizationId
    if (!organizationId) {
      ElMessage.error('未获取到组织信息，请重新登录')
      router.push('/login')
      return
    }

    listState.loading = true

    try {
      const params: PlantPageRequest = {
        page: listState.page,
        rows: listState.rows,
        name: listState.searchName || undefined,
        categoryId: listState.filterCategoryId || undefined,
        commonFlag: listState.filterCommonFlag,
        organizationId, // 已验证的 organizationId
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }

      const res = await plantApi.selectPage(params)

      if (res.code === 'success') {
        // 成功加载
        listState.list = res.data.list
        listState.total = res.data.total
      } else if (res.code === 'unauthorized') {
        // 2. 处理权限错误
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      } else {
        // 3. 处理业务错误
        ElMessage.error(res.message || '加载失败')
      }
    } catch (error) {
      // 4. 处理网络错误
      console.error('加载植物列表失败:', error)
      const errorMessage = error instanceof Error ? error.message : '加载失败，请稍后重试'
      ElMessage.error(errorMessage)
    } finally {
      listState.loading = false
    }
  }

  /**
   * 搜索
   * @description 重置到第1页并加载列表
   */
  const handleSearch = (): void => {
    listState.page = 1 // 重置到第1页
    loadList()
  }

  /**
   * 重置搜索条件
   * @description 清空所有筛选条件并加载列表
   */
  const handleReset = (): void => {
    listState.page = 1
    listState.searchName = ''
    listState.filterCategoryId = ''
    listState.filterCommonFlag = undefined
    loadList()
  }

  /**
   * 分页变化
   * @param page 页码
   * @param rows 每页条数
   */
  const handlePageChange = (page: number, rows: number): void => {
    listState.page = page
    listState.rows = rows
    loadList()
  }

  /**
   * 选择变化
   * @param selectedIds 选中的 ID 列表
   */
  const handleSelectionChange = (selectedIds: string[]): void => {
    listState.selectedIds = selectedIds
  }

  return {
    listState,
    loadList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSelectionChange
  }
}
