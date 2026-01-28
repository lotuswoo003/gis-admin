# ContextMenu 右键菜单组件

一个可配置的右键菜单组件，支持动态菜单项和条件显示。

## 基本使用

```vue
<template>
  <div>
    <YourComponent @right-click="handleRightClick" />
    <ContextMenu ref="contextMenuRef" :items="menuItems" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ContextMenu from '@/components/context-menu/index.vue'
import type { MenuItemData } from '@/components/context-menu/index.d'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'

const contextMenuRef = ref<InstanceType<typeof ContextMenu>>()
const selectedItem = ref<any>()

// 定义菜单项
const menuItems = computed<MenuItemData[]>(() => [
  {
    key: 'edit',
    label: '编辑',
    icon: Edit,
    isEnabled: () => !!selectedItem.value, // 动态判断是否启用
    func: async () => {
      console.log('编辑', selectedItem.value)
      // 处理编辑逻辑
    },
  },
  {
    key: 'add',
    label: '新增',
    icon: Plus,
    enable: true, // 静态启用状态
    func: async () => {
      console.log('新增')
      // 处理新增逻辑
    },
  },
  {
    key: 'delete',
    label: '删除',
    icon: Delete,
    isEnabled: () => !!selectedItem.value,
    func: async () => {
      console.log('删除', selectedItem.value)
      // 处理删除逻辑
    },
  },
])

// 处理右键点击
const handleRightClick = (event: any) => {
  selectedItem.value = event.data
  contextMenuRef.value?.show(event.x, event.y, event)
}
</script>
```

## MenuItemData 接口

```typescript
interface MenuItemData {
  key: number | string        // 菜单项唯一标识
  label: string               // 菜单项显示文本
  icon?: string              // 图标（Element Plus Icon 组件）
  enable?: boolean           // 静态启用状态
  isEnabled?: () => boolean  // 动态判断是否启用（优先级高于 enable）
  func?: (event?: any) => void | Promise<void>  // 点击回调函数
  commandName?: string       // 命令名称（预留）
  callback?: (event: any) => void | Promise<any>  // 回调函数（预留）
}
```

## API

### Props

| 参数  | 说明     | 类型            | 默认值 |
|-------|----------|-----------------|--------|
| items | 菜单项列表 | MenuItemData[] | []     |

### Methods

| 方法名 | 说明           | 参数                                    |
|--------|----------------|----------------------------------------|
| show   | 显示右键菜单   | (x: number, y: number, event?: any)   |
| hide   | 隐藏右键菜单   | -                                      |

## 在 Map 组件中使用

Map 组件已经内置了右键点击事件支持：

```vue
<template>
  <Map
    @right-click="onRightClick"
    :polygons="data"
  />
  <ContextMenu ref="contextMenuRef" :items="menuItems" />
</template>

<script setup lang="ts">
const onRightClick = (event: {
  x: number
  y: number
  screenPoint: any
  mapPoint: any
  graphic?: any
  data?: PolygonData
}) => {
  // event.data 包含被点击的地块数据
  contextMenuRef.value?.show(event.x, event.y, event)
}
</script>
```

## 注意事项

1. 菜单项的 `isEnabled` 优先级高于 `enable`
2. 点击菜单项后会自动隐藏菜单
3. 点击页面其他位置会自动关闭菜单
4. 组件会自动阻止浏览器默认的右键菜单
