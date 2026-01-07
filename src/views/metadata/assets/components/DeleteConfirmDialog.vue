<template>
  <el-dialog
    :model-value="visible"
    :title="deleteType === 'single' ? '确认删除' : '确认批量删除'"
    width="400px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="delete-confirm-content">
      <el-icon class="warning-icon" :size="24" color="#f56c6c">
        <WarningFilled />
      </el-icon>
      <p v-if="deleteType === 'single'">
        确定要删除该植物信息吗？此操作不可恢复。
      </p>
      <p v-else>
        确定要删除选中的 <strong>{{ deleteCount }}</strong> 条植物信息吗？此操作不可恢复。
      </p>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="danger" :loading="loading" @click="handleConfirm">
        确定删除
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'

interface Props {
  /** 对话框可见性 */
  visible: boolean
  /** 删除类型 */
  deleteType: 'single' | 'batch'
  /** 删除数量 */
  deleteCount: number
  /** 加载中 */
  loading?: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 确认删除
 */
const handleConfirm = () => {
  emit('confirm')
}

/**
 * 取消 / 关闭
 */
const handleClose = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped lang="scss">
.delete-confirm-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .warning-icon {
    flex-shrink: 0;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #606266;

    strong {
      color: #f56c6c;
    }
  }
}
</style>
