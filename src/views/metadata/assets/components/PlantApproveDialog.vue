<template>
  <el-dialog
    :model-value="visible"
    title="信息审核"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="分类" prop="categoryId">
        <el-tree-select
          v-model="formData.categoryId"
          :data="categoryOptions"
          placeholder="请选择分类"
          check-strictly
          :render-after-expand="false"
        />
      </el-form-item>

      <el-alert
        v-if="showNameExistError"
        title="名称已存在"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
      >
        <template #default>
          <el-checkbox v-model="mergeNameSubmit">
            是否合并名称
          </el-checkbox>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PlantBasicInfoListResponse, PlantCategory } from '@/types/metadata/plant'

interface Props {
  /** 对话框可见性 */
  visible: boolean
  /** 待审核的植物数据 */
  plantData: PlantBasicInfoListResponse | null
  /** 分类选项 */
  categoryOptions: PlantCategory[]
  /** 加载中 */
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: { name: string; categoryId: string; mergeNameSubmit: boolean }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  name: '',
  categoryId: ''
})

// 名称重复错误标志
const showNameExistError = ref(false)
// 是否合并名称
const mergeNameSubmit = ref(false)

// 监听名称重复错误，重置合并选项
watch(showNameExistError, (val) => {
  if (!val) {
    mergeNameSubmit.value = false
  }
})

// 监听表单数据变化，重置名称重复错误
watch(formData, () => {
  showNameExistError.value = false
})

// 监听对话框打开，初始化表单数据
watch(
  () => props.visible,
  (val) => {
    if (val && props.plantData) {
      formData.name = props.plantData.name
      formData.categoryId = props.plantData.categoryId
      showNameExistError.value = false
      mergeNameSubmit.value = false
    }
  }
)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', {
        name: formData.name,
        categoryId: formData.categoryId,
        mergeNameSubmit: mergeNameSubmit.value
      })
    }
  })
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  formRef.value?.resetFields()
  showNameExistError.value = false
  mergeNameSubmit.value = false
  emit('update:visible', false)
  emit('cancel')
}

/**
 * 显示名称重复错误
 */
const showNameExistErrorMessage = () => {
  showNameExistError.value = true
}

// 暴露方法给父组件
defineExpose({
  showNameExistErrorMessage
})
</script>

<style scoped lang="scss">
// 样式可根据需要调整
</style>

