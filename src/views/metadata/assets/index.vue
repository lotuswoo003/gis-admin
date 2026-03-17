<template>
  <div class="plant-management-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>资产信息管理</h2>
    </div>

    <!-- 搜索栏 -->
    <PlantSearchBar
      v-model:search-name="listState.searchName"
      v-model:filter-category-id="listState.filterCategoryId"
      v-model:filter-common-flag="listState.filterCommonFlag"
      :category-options="categoryOptions"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 标签筛选区域 -->
    <TagFilter
      :all-tags="allTags"
      :selected-tags="listState.filterTags"
      @toggle-tag="handleToggleTag"
      @add-tag="handleAddTagClick"
    />

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增植物
      </el-button>
      <el-button
        type="success"
        :disabled="listState.selectedIds.length === 0"
        :loading="approving"
        @click="handleBatchApprove"
      >
        <el-icon><Check /></el-icon>
        批量过审
      </el-button>
      <el-button
        type="danger"
        :disabled="listState.selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 植物列表表格 -->
    <PlantTable
      :list="listState.list"
      :total="listState.total"
      :page="listState.page"
      :rows="listState.rows"
      :loading="listState.loading"
      :selected-ids="listState.selectedIds"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @edit="handleEdit"
      @delete="handleDelete"
      @reset="handleReset"
      @approve="handleApprove"
    />

    <!-- 新增/编辑对话框 -->
    <PlantFormDialog
      v-model:visible="formState.visible"
      :mode="formState.mode"
      :form-data="formState.formData"
      :category-options="categoryOptions"
      :tag-options="allTags"
      :loading="formState.loading"
      @submit="handleFormSubmit"
      @cancel="handleFormCancel"
    />

    <!-- 删除确认对话框 -->
    <DeleteConfirmDialog
      v-model:visible="deleteState.visible"
      :delete-type="deleteState.deleteType"
      :delete-count="deleteState.deleteIds.length"
      :loading="deleteState.loading"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    />

    <!-- 新增标签对话框 -->
    <AddTagDialog
      v-model:visible="addTagDialogVisible"
      :loading="addTagLoading"
      @submit="handleAddTagSubmit"
    />

    <!-- 审核对话框 -->
    <PlantApproveDialog
      v-model:visible="approveDialogVisible"
      :plant-data="currentApprovePlant"
      :category-options="categoryOptions"
      :loading="approving"
      @submit="handleApproveDialogSubmit"
      @cancel="handleApproveDialogCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, Delete, Check } from '@element-plus/icons-vue'

import PlantSearchBar from './components/PlantSearchBar.vue'
import PlantTable from './components/PlantTable.vue'
import PlantFormDialog from './components/PlantFormDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'
import TagFilter from './components/TagFilter.vue'
import AddTagDialog from './components/AddTagDialog.vue'
import PlantApproveDialog from './components/PlantApproveDialog.vue'

import { usePlantList } from './composables/usePlantList'
import { usePlantForm } from './composables/usePlantForm'
import { usePlantDelete } from './composables/usePlantDelete'
import { usePlantTags } from './composables/usePlantTags'
import { usePlantApprove } from './composables/usePlantApprove'

// 列表逻辑
const {
  listState,
  loadList,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSelectionChange
} = usePlantList()

// 表单逻辑
const {
  formState,
  categoryOptions,
  loadCategories,
  handleAdd,
  handleEdit,
  handleFormSubmit,
  handleFormCancel
} = usePlantForm(loadList)

// 删除逻辑
const {
  deleteState,
  handleDelete,
  handleBatchDelete,
  handleDeleteConfirm,
  handleDeleteCancel
} = usePlantDelete(loadList, listState)

// 标签逻辑
const {
  allTags,
  addTagDialogVisible,
  addTagLoading,
  loadTags,
  toggleTag,
  handleAddTagClick,
  handleAddTagSubmit
} = usePlantTags()

// 审批逻辑
const {
  approving,
  approveDialogVisible,
  currentApprovePlant,
  handleApprove,
  handleApproveDialogSubmit,
  handleApproveDialogCancel,
  handleBatchApprove
} = usePlantApprove(loadList, listState)

/**
 * 处理标签切换
 */
const handleToggleTag = (tagName: string) => {
  toggleTag(tagName)
  // 重新加载列表
  handleSearch()
}

// 页面挂载时加载数据
onMounted(async () => {
  // 并行加载分类和标签
  await Promise.all([
    loadCategories(),
    loadTags()
  ])
  // 然后加载列表
  await loadList()
})
</script>

<style scoped lang="scss">
.plant-management-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .action-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }
}
</style>
