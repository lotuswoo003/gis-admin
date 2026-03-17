import Graphic from '@arcgis/core/Graphic'
import type MapContext from '@/components/map-context'
import { LayerType, type IMapTool } from '@/components/map-context/types.d'
import { uuid } from '@/utils/commonUtil'
import { ElMessage } from 'element-plus'

export default class createLandmassTool implements IMapTool {
  private _name = 'CreateLandmassTool'
  private _mapContext: MapContext | null = null
  private _cbk?: (event: any) => any = () => {}

  get name(): string {
    return this._name
  }

  get enabled() {
    return this._mapContext?.mapSelected?.length === 0
  }

  create(mapContext: MapContext | null): void {
    this._mapContext = mapContext
    if (!this._mapContext || !this._mapContext.sketchManager) {
      throw new Error('MapContext is not initialized or sketch manager null.')
    }
    if (this._mapContext.currentTool !== this) {
      this._mapContext.currentTool && this._mapContext.currentTool.destroy()
      this._mapContext.currentTool = this
      this._mapContext.on('graphic-created', this.handleCreated, this)
    }
  }

  async startAction(cbk?: (event: any) => any): Promise<void> {
    if (!this._mapContext || !this._mapContext.sketchManager) return
    this._cbk = cbk

    this._mapContext.sketchManager.sketch.creationMode = 'update'
    this._mapContext.sketchManager.sketch.create('polygon', { mode: 'click' })
  }

  handleCreated = async (graphic: Graphic) => {
    console.log('---handleCreated---', graphic)
    try {
      await this.addLandmassToMap(graphic)
    } catch (e) {
      console.error('----地块添加失败----', e)
      ElMessage.error('地块添加失败')
    }
  }

  async addLandmassToMap(graphic: Graphic) {
    if (!this._cbk || !this._mapContext) return

    // 设置 graphic 的属性
    graphic.attributes = {
      ...graphic.attributes,
      id: uuid('block'),
      type: LayerType.Mass,
      interop: true,
    }
    graphic.symbol = this._mapContext.getSymbol(LayerType.Mass, 'normal')

    const res = await this._cbk({ action: 'create', graphic })
    if (res && res.code !== 0) {
      console.log('---地块添加失败---', res)
      ElMessage.error(res.message || '地块添加失败')
      return
    }

    // 更新 graphic 的 id（从后端返回）
    if (res?.data?.id) {
      graphic.attributes.id = res.data.id
    }

    // 添加到 Mass 图层
    const massLayer = this._mapContext.getDataLayer(LayerType.Mass)
    massLayer.addFeature(graphic)

    ElMessage.success('地块创建成功')
    console.log('---create Landmass handle Created---', graphic)
  }

  destroy() {
    this._mapContext?.off('graphic-created', this.handleCreated)
    if (this._mapContext) {
      this._mapContext.currentTool = null
    }
  }
}
