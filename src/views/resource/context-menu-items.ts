import { ref, type ShallowRef, shallowRef } from 'vue'
import type { MenuItemData } from '@/components/context-menu/index.d'
import {
  Location,
  Refresh,
  Delete,
  DataLine,
  CirclePlus,
  Minus,
  Connection,
  EditPen,
  Edit,
} from '@element-plus/icons-vue'
import type { GisResourcePool } from '@/types/resource-pool'
import createLandmassTool from '@/components/context-menu/commands/createLandmassTool'
import createLineLandmassTool from '@/components/context-menu/commands/createLineLandmassTool'
import splitTool from '@/components/context-menu/commands/splitTool'
import mergeTool from '@/components/context-menu/commands/mergeTool'
import editTool from '@/components/context-menu/commands/editTool'
import { polygonToWkt } from '@/components/map-context/utils'
import { createResourcePool,updateResourcePool,deleteResourcePool } from '@/api/resource-pool'
import { ElMessage } from 'element-plus'

// 命令映射（可以保持全局，因为是无状态的）
export const commandMap: Record<string, any> = {
  createLandmassTool: new createLandmassTool(),
  createLineLandmassTool: new createLineLandmassTool(),
  splitTool: new splitTool(),
  mergeTool: new mergeTool(),
  editTool: new editTool(),
}

/**
 * 资源池右键菜单组合式函数
 * @param options 配置选项
 * @returns 菜单相关的状态和方法
 */
export function useResourcePoolContextMenu(options: {
  organizationId: string
  onRefresh?: () => void
}) {
  // 右键上下文状态
  const rightClickContext: ShallowRef<GisResourcePool | undefined> = shallowRef()

  // 地图多选状态
  const selectedCount = ref(0)

  // 菜单操作回调
  const menuActions = {
    onCreateLine: async (event: any) => {
      // TODO: 实现线型地块创建
      try {
        const geoWKT = polygonToWkt(event.graphic.geometry)
        const res = await createResourcePool({
          organizationId: options.organizationId,
          polygon: geoWKT,
        })
        if (res.code !== 0) {
          return { code: 'error', message: '创建地块(线型)失败' }
        }

        ElMessage.success('地块创建成功')
        options.onRefresh?.()

        return { code: 0, data: { id: res.data } }
      } catch (e) {
        console.error('---创建地块(线型)失败---', e)
        return { code: 'error', message: '创建地块失败' }
      }
    },

    onCreatePolygon: async (event: any) => {
      console.log('---创建地块(面型)---')
      try {
        const geoWKT = polygonToWkt(event.graphic.geometry)
        const res = await createResourcePool({
          organizationId: options.organizationId,
          polygon: geoWKT,
        })

        if (res.code !== 0) {
          return { code: 1, message: '创建地块失败' }
        }
        ElMessage.success('地块创建成功')
        options.onRefresh?.()

        return { code: 0, data: [res.data] }
      } catch (e) {
        console.error('---创建地块(面型)失败---', e)
        return { code: 1, message: '创建地块失败' }
      }
    },

    onLocate: (_data: GisResourcePool) => {},
    onEdit: async (event: any) => {
      try {
        const { graphic } = event
        if (!graphic || !graphic.attributes?.id) {
          return { code: 'error', message: '无效的地块数据' }
        }

        const geoWKT = polygonToWkt(graphic.geometry)
        const res = await updateResourcePool({id: graphic.attributes.id, polygon: geoWKT})

        if (res.code !== 0) {
          return { code: 'error', message: '更新地块失败' }
        }

        ElMessage.success('地块更新成功')
        options.onRefresh?.()

        return { code: 0, data: res.data }
      } catch (e) {
        console.error('---更新地块失败---', e)
        return { code: 'error', message: '更新地块失败' }
      }
    },
    onCut: async (event: any) => {
      try {
        const { sourceGraphics, resultsGraphics } = event
        if (
          !sourceGraphics ||
          !resultsGraphics ||
          sourceGraphics.length === 0 ||
          resultsGraphics.length === 0
        ) {
          return { code: 'error', message: '无效的地块数据' }
        }

        // const res = await updateResourcePool({
        //   removeIdList: sourceGraphics.map((g: any) => g.attributes.id),
        //   resourcePoolList: resultsGraphics.map((g: any) => ({
        //     organizationId: currentOrgInfo.id,
        //     polygon: polygonToWkt(g.geometry),
        //   })),
        // })

        // if (res.code !== 0) {
        //   return { code: 'error', message: '切割地块失败' }
        // }

        // return { code: 'success', data: res.data }
      } catch (e) {
        console.error('---切割地块失败---', e)
        return { code: 'error', message: '切割地块失败' }
      }
    },
    onMerge: async (event: any) => {
      try {
        const { sourceGraphics, result } = event
        if (!sourceGraphics || !result || sourceGraphics.length === 0) {
          return { code: 'error', message: '无效的地块数据' }
        }

        // const res = await updateBatchResourceMass({
        //   removeIdList: sourceGraphics.map((g: any) => g.attributes.id),
        //   resourcePoolList: [{
        //     organizationId: currentOrgInfo.id,
        //     polygon: polygonToWkt(result.geometry),
        //   }],
        // })

        // if (res.code !== 0) {
        //   return { code: 'error', message: '合并地块失败' }
        // }

        // return { code: 'success', data: res.data }
      } catch (e) {
        console.error('---合并地块失败---', e)
        return { code: 'error', message: '合并地块失败' }
      }
    },
    onRename: (_data: GisResourcePool) => {},
    onSync: (_data: GisResourcePool) => {},
    onDelete: (_data: GisResourcePool) => {},
  }

  // 菜单项列表
  const contextMenuItems: ShallowRef<MenuItemData[]> = shallowRef([
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
      icon: Edit,
      label: '编辑地块',
      isEnabled: () => !!rightClickContext.value && selectedCount.value <= 1,
      commandName: 'editTool',
      callback: async (event) => {
        return await menuActions.onEdit(event)
      },
    },
    {
      key: 5,
      icon: Minus,
      label: '切割地块',
      isEnabled: () => !!rightClickContext.value,
      commandName: 'splitTool',
      callback: async (event) => {
        return await menuActions.onCut(event)
      },
    },
    {
      key: 6,
      icon: Connection,
      label: '合并地块',
      isEnabled: () => selectedCount.value > 1,
      commandName: 'mergeTool',
      callback: async (event) => {
        return await menuActions.onMerge(event)
      },
    },
    {
      key: 7,
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
      key: 8,
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
      key: 9,
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

  return {
    rightClickContext,
    selectedCount,
    menuActions,
    contextMenuItems,
  }
}
