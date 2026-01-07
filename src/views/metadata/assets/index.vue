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

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增植物
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
    />

    <!-- 新增/编辑对话框 -->
    <PlantFormDialog
      v-model:visible="formState.visible"
      :mode="formState.mode"
      :form-data="formState.formData"
      :category-options="categoryOptions"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

import PlantSearchBar from './components/PlantSearchBar.vue'
import PlantTable from './components/PlantTable.vue'
import PlantFormDialog from './components/PlantFormDialog.vue'
import DeleteConfirmDialog from './components/DeleteConfirmDialog.vue'

import { usePlantList } from './composables/usePlantList'
import { usePlantForm } from './composables/usePlantForm'
import { usePlantDelete } from './composables/usePlantDelete'

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

// 页面挂载时加载数据
onMounted(async () => {
  // 先加载分类，再加载列表
  await loadCategories()
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
  }
}
</style>
