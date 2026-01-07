<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增标签"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="标签名称" prop="tagName">
        <el-input
          v-model="formData.tagName"
          placeholder="请输入标签名称"
          maxlength="20"
          show-word-limit
          clearable
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  visible: boolean
  loading: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', tagName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = ref(props.visible)
const formRef = ref<FormInstance>()

const formData = ref({
  tagName: ''
})

const rules: FormRules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度为 1-20 个字符', trigger: 'blur' }
  ]
}

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    // 打开对话框时重置表单
    formData.value.tagName = ''
    formRef.value?.clearValidate()
  }
})

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', formData.value.tagName)
    }
  })
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
