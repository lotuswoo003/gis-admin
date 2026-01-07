<template>
  <div class="plant-table">
    <!-- 表格 -->
    <el-table
      :data="list"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
    >
      <!-- 多选列 -->
      <el-table-column
        type="selection"
        width="55"
        :selectable="checkSelectable"
      />

      <!-- 序号列 -->
      <el-table-column type="index" label="序号" width="60" />

      <!-- 植物名称 -->
      <el-table-column
        prop="name"
        label="植物名称"
        min-width="150"
        show-overflow-tooltip
      />

      <!-- 植物分类 -->
      <el-table-column
        prop="categoryName"
        label="植物分类"
        min-width="120"
        show-overflow-tooltip
      />

      <!-- 拉丁学名 -->
      <el-table-column
        prop="latinName"
        label="拉丁学名"
        min-width="150"
        show-overflow-tooltip
      />

      <!-- 是否常见 -->
      <el-table-column
        prop="commonFlag"
        label="是否常见"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.commonFlag === 1 ? 'success' : 'info'" size="small">
            {{ row.commonFlag === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 状态 -->
      <el-table-column
        prop="status"
        label="状态"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column
        prop="createdAt"
        label="创建时间"
        width="160"
        show-overflow-tooltip
      />

      <!-- 操作列 -->
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>

      <!-- 空态 -->
      <template #empty>
        <el-empty description="暂无数据">
          <el-button type="primary" @click="handleResetClick">重置筛选条件</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 16px; justify-content: flex-end"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlantBasicInfoListResponse } from '@/types/metadata/plant'

interface Props {
  /** 列表数据 */
  list: PlantBasicInfoListResponse[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页条数 */
  rows: number
  /** 加载中 */
  loading: boolean
  /** 已选中的 ID 列表 */
  selectedIds: string[]
}

interface Emits {
  (e: 'pageChange', page: number, rows: number): void
  (e: 'selectionChange', selectedIds: string[]): void
  (e: 'edit', row: PlantBasicInfoListResponse): void
  (e: 'delete', row: PlantBasicInfoListResponse): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 分页组件的本地状态
const currentPage = ref(props.page)
const pageSize = ref(props.rows)

// 监听外部变化同步到本地
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.rows, (val) => {
  pageSize.value = val
})

/**
 * 页码变化
 */
const handlePageChange = (page: number) => {
  emit('pageChange', page, pageSize.value)
}

/**
 * 每页条数变化 - 回到第1页
 */
const handleSizeChange = (rows: number) => {
  emit('pageChange', 1, rows)
}

/**
 * 选择变化
 */
const handleSelectionChange = (selection: PlantBasicInfoListResponse[]) => {
  const selectedIds = selection.map(item => item.id)
  emit('selectionChange', selectedIds)
}

/**
 * 检查行是否可选
 * @description 已删除的记录不可选
 */
const checkSelectable = (row: PlantBasicInfoListResponse): boolean => {
  return !row.deletedAt // 已删除的不可选
}

/**
 * 编辑
 */
const handleEdit = (row: PlantBasicInfoListResponse) => {
  emit('edit', row)
}

/**
 * 删除
 */
const handleDelete = (row: PlantBasicInfoListResponse) => {
  emit('delete', row)
}

/**
 * 空态重置按钮点击
 */
const handleResetClick = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
.plant-table {
  background: #ffffff;
  padding: 16px;
  border-radius: 4px;
}
</style>
