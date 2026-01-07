<template>
  <div class="tag-filter">
    <span class="tag-filter-label">筛选：</span>
    <div class="tag-filter-items">
      <!-- 已有标签 -->
      <el-tag
        v-for="tag in allTags"
        :key="tag.name"
        :type="isTagSelected(tag.name) ? 'primary' : 'info'"
        :effect="isTagSelected(tag.name) ? 'dark' : 'plain'"
        class="tag-item"
        @click="toggleTag(tag.name)"
      >
        {{ tag.name }}
      </el-tag>

      <!-- 新增标签按钮 -->
      <el-tag
        class="tag-item add-tag-btn"
        type="primary"
        :effect="'plain'"
        @click="handleAddTag"
      >
        <el-icon><Plus /></el-icon>
        新增标签
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import type { PlantTag } from '@/types/metadata/plant'

interface Props {
  /** 所有标签列表 */
  allTags: PlantTag[]
  /** 已选中的标签 */
  selectedTags: string[]
}

interface Emits {
  (e: 'toggleTag', tagName: string): void
  (e: 'addTag'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 判断标签是否被选中
 */
const isTagSelected = (tagName: string): boolean => {
  return props.selectedTags.includes(tagName)
}

/**
 * 切换标签选中状态
 */
const toggleTag = (tagName: string) => {
  emit('toggleTag', tagName)
}

/**
 * 新增标签
 */
const handleAddTag = () => {
  emit('addTag')
}
</script>

<style scoped lang="scss">
.tag-filter {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;

  .tag-filter-label {
    font-size: 14px;
    color: #606266;
    margin-right: 12px;
    white-space: nowrap;
  }

  .tag-filter-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;

    .tag-item {
      cursor: pointer;
      user-select: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .add-tag-btn {
      border-style: dashed;

      :deep(.el-icon) {
        margin-right: 4px;
      }
    }
  }
}
</style>
