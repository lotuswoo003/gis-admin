<template>
  <el-dialog v-model="visible" title="同步到项目" width="500px" @close="handleClose">
    <el-form label-width="100px">
      <el-form-item label="选择项目">
        <el-select
          v-model="selectedProjectId"
          placeholder="请选择项目"
          filterable
          remote
          :remote-method="loadProjects"
          :loading="projectLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="syncLoading" @click="handleConfirm">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { syncResourcePool } from '@/api/resource-pool'
import { fetchProjectPage } from '@/api/project'
import type { RawProject } from '@/types/project'

interface Props {
  modelValue: boolean
  resourcePoolIds?: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  resourcePoolIds: () => [],
})

const emit = defineEmits<Emits>()

// 内部状态
const visible = ref(false)
const selectedProjectId = ref('')
const projectList = ref<RawProject[]>([])
const projectLoading = ref(false)
const syncLoading = ref(false)

// 监听外部 v-model 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 对话框打开时，重置状态并加载项目列表
      selectedProjectId.value = ''
      loadProjects('')
    }
  },
  { immediate: true }
)

// 监听内部 visible 变化，同步到外部
watch(visible, (newVal) => {
  if (newVal !== props.modelValue) {
    emit('update:modelValue', newVal)
  }
})

/**
 * 加载项目列表
 * @param query 搜索关键词
 */
const loadProjects = async (query: string) => {
  projectLoading.value = true
  try {
    const res = await fetchProjectPage({
      page: 1,
      rows: 50,
      name: query,
    })
    projectList.value = res.data?.list || []
  } catch (error) {
    console.error('Failed to load projects', error)
    ElMessage.error('加载项目列表失败')
  } finally {
    projectLoading.value = false
  }
}

/**
 * 确认同步
 */
const handleConfirm = async () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择一个项目')
    return
  }

  if (!props.resourcePoolIds || props.resourcePoolIds.length === 0) {
    ElMessage.warning('没有要同步的资源池')
    return
  }

  syncLoading.value = true
  try {
    await syncResourcePool({
      projectId: selectedProjectId.value,
      idList: props.resourcePoolIds,
    })
    ElMessage.success('同步成功')
    visible.value = false
    emit('success')
  } catch (e: any) {
    ElMessage.error(e?.message || '同步失败')
  } finally {
    syncLoading.value = false
  }
}

/**
 * 取消操作
 */
const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

/**
 * 对话框关闭回调
 */
const handleClose = () => {
  emit('cancel')
}
</script>
