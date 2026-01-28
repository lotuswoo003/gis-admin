import { ref, type Ref, type ShallowRef, shallowRef } from 'vue'
import type { MenuItemData } from '@/components/context-menu/index.d'
import {
  Location, Refresh, Delete,
  DataLine, CirclePlus, Minus, Connection, EditPen,
} from '@element-plus/icons-vue'
import type { GisResourcePool } from '@/types/resource-pool'

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

const contextMenuItemList: Ref<MenuItemData[]> = ref([
  {
    key: 1,
    icon: DataLine,
    label: '创建地块(线型)',
    isEnabled: () => !rightClickContext.value,
    func: async () => {
      menuActions.onCreateLine()
    },
  },
  {
    key: 2,
    icon: CirclePlus,
    label: '创建地块(面型)',
    isEnabled: () => !rightClickContext.value,
    func: async () => {
      menuActions.onCreatePolygon()
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
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onCut(rightClickContext.value)
      }
    },
  },
  {
    key: 5,
    icon: Connection,
    label: '合并地块',
    isEnabled: () => selectedCount.value > 1,
    func: async () => {
      if (rightClickContext.value) {
        menuActions.onMerge(rightClickContext.value)
      }
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
