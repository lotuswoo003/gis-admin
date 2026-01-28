import { ref, type Ref, type ShallowRef, shallowRef } from 'vue'
import type { MenuItemData } from '@/components/context-menu/index.d'
import {
  Location, Refresh, Delete,
  DataLine, CirclePlus, Minus, Connection, EditPen,
} from '@element-plus/icons-vue'
import type { GisResourcePool } from '@/types/resource-pool'
import createLandmassTool from '@/components/context-menu/commands/createLandmassTool'
import createLineLandmassTool from '@/components/context-menu/commands/createLineLandmassTool'
import splitTool from '@/components/context-menu/commands/splitTool'
import mergeTool from '@/components/context-menu/commands/mergeTool'

// 右键上下文状态，由父组件更新
export const rightClickContext: ShallowRef<GisResourcePool | undefined> = shallowRef()

// 地图多选状态，由父组件通过 selection-change 事件更新
export const selectedCount = ref(0)

// 菜单操作回调，由父组件注册
export const menuActions = {
  onCreateLine: (_data?: GisResourcePool) => {},
  onCreatePolygon: (_data?: GisResourcePool) => {},
  onLocate: (_data: GisResourcePool) => {},
  onCut: (_data: GisResourcePool) => {},
  onMerge: (_data: GisResourcePool) => {},
  onRename: (_data: GisResourcePool) => {},
  onSync: (_data: GisResourcePool) => {},
  onDelete: (_data: GisResourcePool) => {},
}

// 命令映射
export const commandMap: Record<string, any> = {
  createLandmassTool: new createLandmassTool(),
  createLineLandmassTool: new createLineLandmassTool(),
  splitTool: new splitTool(),
  mergeTool: new mergeTool(),
}

const contextMenuItemList: Ref<MenuItemData[]> = ref([
  {
    key: 1,
    icon: DataLine,
    label: '创建地块(线型)',
    isEnabled: () => !rightClickContext.value,
    commandName: 'createLineLandmassTool',
    callback: async (event) => {
      return await menuActions.onCreateLine(event)
    },
  },
  {
    key: 2,
    icon: CirclePlus,
    label: '创建地块(面型)',
    isEnabled: () => !rightClickContext.value,
    commandName: 'createLandmassTool',
    callback: async (event) => {
      return await menuActions.onCreatePolygon(event)
    },
  },
  {
    key: 3,
    icon: Location,
    label: '定位到此地块',
    isEnabled: () => !!rightClickContext.value && selectedCount.value <= 1,
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onLocate(rightClickContext.value)
      }
    },
  },
  {
    key: 4,
    icon: Minus,
    label: '切割地块',
    isEnabled: () => !!rightClickContext.value,
    commandName: 'splitTool',
    callback: async (event) => {
      return await menuActions.onCut(event)
    },
  },
  {
    key: 5,
    icon: Connection,
    label: '合并地块',
    isEnabled: () => selectedCount.value > 1,
    commandName: 'mergeTool',
    callback: async (event) => {
      return await menuActions.onMerge(event)
    },
  },
  {
    key: 6,
    icon: EditPen,
    label: '地块命名',
    isEnabled: () => !!rightClickContext.value && selectedCount.value <= 1,
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onRename(rightClickContext.value)
      }
    },
  },
  {
    key: 7,
    icon: Refresh,
    label: '同步地块',
    isEnabled: () => !!rightClickContext.value && selectedCount.value <= 1,
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onSync(rightClickContext.value)
      }
    },
  },
  {
    key: 8,
    icon: Delete,
    label: '删除地块',
    isEnabled: () => !!rightClickContext.value,
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onDelete(rightClickContext.value)
      }
    },
  },
])

export default contextMenuItemList
