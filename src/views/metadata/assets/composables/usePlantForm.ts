/**
 * 植物表单逻辑 Composable
 * @description 负责植物新增/编辑表单的状态管理和提交逻辑
 */

import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { plantApi } from '@/api/metadata/plant'
import { plantCategoryApi } from '@/api/metadata/plantCategory'
import { useUserStore } from '@/store/user'
import type {
  PlantFormState,
  PlantInsertRequest,
  PlantUpdateRequest,
  PlantCategory,
  PlantBasicInfoListResponse
} from '@/types/metadata/plant'

/**
 * 植物表单逻辑
 * @param onSuccess 成功回调（刷新列表）
 */
export function usePlantForm(onSuccess: () => void) {
  const userStore = useUserStore()
  const router = useRouter()

  // 表单状态
  const formState = reactive<PlantFormState>({
    visible: false,
    mode: 'add',
    formData: createEmptyFormData(),
    loading: false
  })

  // 分类选项
  const categoryOptions = ref<PlantCategory[]>([])

  /**
   * 创建空表单数据
   * @returns 空的表单数据对象
   */
  function createEmptyFormData(): PlantInsertRequest {
    return {
      name: '',
      categoryId: '',
      commonFlag: 0,
      status: 1,
      chinaCode: '',
      latinName: '',
      englishName: '',
      alias: '',
      plantae: '',
      phyta: '',
      subclass: '',
      subject: '',
      family: '',
      subfamily: '',
      clan: '',
      category: '',
      kind: '',
      source: '',
      organizationId: userStore.currentOrganizationId
    }
  }

  /**
   * 加载分类列表
   */
  const loadCategories = async (): Promise<void> => {
    try {
      const res = await plantCategoryApi.selectList({
        organizationId: userStore.currentOrganizationId // 可选，管理端可能没有
      })

      if (res.code === 0) {
        // 转换数据格式，添加 Element Plus TreeSelect 需要的字段
        categoryOptions.value = convertToTreeSelectFormat(res.data)
      } else {
        ElMessage.error(res.message || '加载分类失败')
      }
    } catch (error) {
      console.error('加载植物分类失败:', error)
      const errorMessage = error instanceof Error ? error.message : '加载分类失败，请刷新页面重试'
      ElMessage.error(errorMessage)
    }
  }

  /**
   * 转换分类数据为 TreeSelect 格式
   */
  const convertToTreeSelectFormat = (categories: PlantCategory[]): PlantCategory[] => {
    return categories.map(category => ({
      ...category,
      label: category.name,
      value: category.id,
      children: category.children ? convertToTreeSelectFormat(category.children) : undefined
    }))
  }

  /**
   * 打开新增对话框
   */
  const handleAdd = (): void => {
    formState.mode = 'add'
    formState.formData = createEmptyFormData()
    formState.visible = true
  }

  /**
   * 打开编辑对话框
   * @param row 要编辑的行数据
   */
  const handleEdit = (row: PlantBasicInfoListResponse): void => {
    formState.mode = 'edit'
    formState.formData = {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      commonFlag: row.commonFlag,
      status: row.status,
      chinaCode: row.chinaCode,
      latinName: row.latinName,
      englishName: row.englishName,
      alias: row.alias,
      plantae: row.plantae,
      phyta: row.phyta,
      subclass: row.subclass,
      subject: row.subject,
      family: row.family,
      subfamily: row.subfamily,
      clan: row.clan,
      category: row.category,
      kind: row.kind,
      source: row.source,
      organizationId: row.organizationId
    }
    formState.visible = true
  }

  /**
   * 提交表单
   * @param formData 表单数据
   */
  const handleFormSubmit = async (formData: PlantInsertRequest | PlantUpdateRequest): Promise<void> => {
    formState.loading = true

    try {
      // organizationId 从用户上下文获取（可选）
      formData.organizationId = userStore.currentOrganizationId

      let res
      if (formState.mode === 'add') {
        res = await plantApi.insert(formData as PlantInsertRequest)
      } else {
        res = await plantApi.update(formData as PlantUpdateRequest)
      }

      if (res.code === 0) {
        ElMessage.success(formState.mode === 'add' ? '新增成功' : '编辑成功')
        formState.visible = false
        onSuccess() // 刷新列表
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      console.error('提交表单失败:', error)
      const errorMessage = error instanceof Error ? error.message : '操作失败，请稍后重试'
      ElMessage.error(errorMessage)
    } finally {
      formState.loading = false
    }
  }

  /**
   * 取消表单
   */
  const handleFormCancel = (): void => {
    formState.visible = false
  }

  return {
    formState,
    categoryOptions,
    loadCategories,
    handleAdd,
    handleEdit,
    handleFormSubmit,
    handleFormCancel
  }
}
