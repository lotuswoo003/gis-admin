<template>
  <div class="plant-search-bar">
    <el-form :inline="true" :model="searchForm" label-width="auto">
      <!-- 植物名称搜索 -->
      <el-form-item label="植物名称">
        <el-input
          v-model="searchForm.searchName"
          placeholder="请输入植物名称"
          clearable
          style="width: 200px"
          @input="handleSearchInput"
          @clear="handleClear"
        />
      </el-form-item>

      <!-- 分类筛选 -->
      <el-form-item label="植物分类">
        <el-tree-select
          v-model="searchForm.filterCategoryId"
          :data="categoryOptions"
          placeholder="请选择分类"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 200px"
          @change="handleCategoryChange"
        />
      </el-form-item>

      <!-- 常见植物筛选 -->
      <el-form-item label="常见植物">
        <el-select
          v-model="searchForm.filterCommonFlag"
          placeholder="全部"
          clearable
          style="width: 120px"
          @change="handleCommonFlagChange"
        >
          <el-option label="全部" :value="undefined" />
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { PlantCategory } from '@/types/metadata/plant'

interface Props {
  /** 搜索关键字 */
  searchName: string
  /** 分类筛选 ID */
  filterCategoryId: string
  /** 常见植物筛选 */
  filterCommonFlag?: number
  /** 分类选项 */
  categoryOptions: PlantCategory[]
}

interface Emits {
  (e: 'update:searchName', value: string): void
  (e: 'update:filterCategoryId', value: string): void
  (e: 'update:filterCommonFlag', value?: number): void
  (e: 'search'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 本地表单状态（用于双向绑定）
const searchForm = reactive({
  searchName: props.searchName,
  filterCategoryId: props.filterCategoryId,
  filterCommonFlag: props.filterCommonFlag
})

// 防抖计时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 防抖函数（500ms）
const debouncedSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    emit('search')
  }, 500)
}

// 监听本地状态变化，同步到父组件
watch(() => searchForm.searchName, (val) => {
  emit('update:searchName', val)
})

watch(() => searchForm.filterCategoryId, (val) => {
  emit('update:filterCategoryId', val)
})

watch(() => searchForm.filterCommonFlag, (val) => {
  emit('update:filterCommonFlag', val)
})

// 监听外部 props 变化，同步到本地状态
watch(() => props.searchName, (val) => {
  searchForm.searchName = val
})

watch(() => props.filterCategoryId, (val) => {
  searchForm.filterCategoryId = val
})

watch(() => props.filterCommonFlag, (val) => {
  searchForm.filterCommonFlag = val
})

/**
 * 输入事件 - 防抖搜索
 */
const handleSearchInput = () => {
  debouncedSearch()
}

/**
 * 清空搜索框 - 立即搜索
 */
const handleClear = () => {
  emit('search')
}

/**
 * 分类变化 - 立即搜索
 */
const handleCategoryChange = () => {
  emit('search')
}

/**
 * 常见植物筛选变化 - 立即搜索
 */
const handleCommonFlagChange = () => {
  emit('search')
}

/**
 * 搜索按钮点击
 */
const handleSearch = () => {
  emit('search')
}

/**
 * 重置按钮点击
 */
const handleReset = () => {
  searchForm.searchName = ''
  searchForm.filterCategoryId = ''
  searchForm.filterCommonFlag = undefined
  emit('update:searchName', '')
  emit('update:filterCategoryId', '')
  emit('update:filterCommonFlag', undefined)
  emit('reset')
}
</script>

<style scoped lang="scss">
.plant-search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #ffffff;
  border-radius: 4px;
}
</style>
