<template>
  <Transition name="el-fade-in">
    <div
      v-show="visible"
      class="context-menu-wrapper"
      :style="{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }"
    >
      <el-menu class="context-menu" @select="handleMenuSelect">
        <template v-for="item in enabledItems" :key="item.key">
          <el-menu-item :index="String(item.key)">
            <el-icon v-if="item.icon" class="menu-icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { MenuItemData } from './index.d'
import { useMapStore } from '@/store/map/map';

const props = defineProps<{
  items: MenuItemData[]
  commandMap?: Record<string, any>
}>()

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const contextEvent = ref<any>(null)
const justOpened = ref(false) // 标记菜单刚刚打开，防止立即关闭

// 过滤出可用的菜单项
const enabledItems = computed(() => {
  return props.items.filter(item => {
    if (item.isEnabled) {
      return item.isEnabled()
    }
    return item.enable ?? true
  })
})

// 显示菜单
const show = (x: number, y: number, event?: any) => {
  position.value = { x, y }
  contextEvent.value = event
  visible.value = true
  justOpened.value = true

  // 100ms 后允许关闭菜单
  setTimeout(() => {
    justOpened.value = false
  }, 100)
}

// 隐藏菜单
const hide = () => {
  visible.value = false
  contextEvent.value = null
  justOpened.value = false
}
const mapStore = useMapStore()
// 处理菜单选择
const handleMenuSelect = async (index: string) => {
  const item = props.items.find(it => String(it.key) === index)
  if (!item) return
  const mapContext = mapStore.getMainMapContext()
  try {
    if (item.func) {
      await item.func(contextEvent.value)
    } else if (item.commandName && props.commandMap && mapContext) {
      // 命令模式
      const command = props.commandMap[item.commandName]
      if (command) {
        command.create(mapContext)
        if (command.execute) {
          await command.execute(item.callback)
        } else if (command.startAction) {
          await command.startAction(item.callback)
        }
      }
    } else if (item.callback) {
      await item.callback(contextEvent.value)
    }
  } catch (error) {
    console.error('菜单操作执行失败:', error)
  }

  hide()
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  if (visible.value && !justOpened.value) {
    const target = event.target as HTMLElement
    const menu = document.querySelector('.context-menu-wrapper')
    if (menu && !menu.contains(target)) {
      hide()
    }
  }
}

// 处理右键菜单事件
const handleContextMenu = (event: MouseEvent) => {
  if (visible.value && !justOpened.value) {
    hide()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('contextmenu', handleContextMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleContextMenu)
})

defineExpose({
  show,
  hide,
})
</script>

<style scoped>
.context-menu-wrapper {
  position: fixed;
  z-index: 9999;
  user-select: none;
}

.context-menu {
  min-width: 160px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
}

.menu-icon {
  margin-right: 8px;
}

:deep(.el-menu-item) {
  height: 36px;
  line-height: 36px;
  font-size: 14px;
  padding: 0 16px;
}

:deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}
</style>
