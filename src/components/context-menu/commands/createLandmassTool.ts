import Graphic from '@arcgis/core/Graphic'
import type { IMapTool, IMapContext } from './types.d'

export default class createLandmassTool implements IMapTool {
  private _name = 'CreateLandmassTool'
  private _mapContext: IMapContext | null = null
  private _cbk?: (event: any) => any = () => {}

  get name(): string {
    return this._name
  }

  get enabled() {
    return this._mapContext?.selectedGraphics?.length === 0
  }

  create(mapContext: IMapContext): void {
    this._mapContext = mapContext
    if (!this._mapContext || !this._mapContext.sketchViewModel) {
      throw new Error('MapContext is not initialized or sketch manager null.')
    }
    if (this._mapContext.currentTool !== this) {
      this._mapContext.currentTool && this._mapContext.currentTool.destroy()
      this._mapContext.currentTool = this
      this._mapContext.on('graphic-created', this.handleCreated, this)
    }
  }

  async startAction(cbk?: (event: any) => any): Promise<void> {
    if (!this._mapContext || !this._mapContext.sketchViewModel) return
    this._cbk = cbk

    this._mapContext.sketchViewModel.create('polygon', { mode: 'click' })
  }

  handleCreated = async (graphic: Graphic) => {
    console.log('---handleCreated---', graphic)
    try {
      await this.addLandmassToMap(graphic)
    } catch (e) {
      console.error('----地块添加失败----', e)
    }
  }

  async addLandmassToMap(graphic: Graphic) {
    if (!this._cbk) return

    const res = await this._cbk({ action: 'create', graphic })
    if (res && res.code !== 0) {
      console.log('---地块添加失败---', res)
      this._mapContext?.sketchLayer?.remove(graphic)
      return
    }

    // 将绘制的图形移到 graphicsLayer
    this._mapContext?.sketchLayer?.remove(graphic)
    this._mapContext?.graphicsLayer?.add(graphic)

    console.log('---create Landmass handle Created---', graphic)
  }

  destroy() {
    this._mapContext?.off('graphic-created', this.handleCreated)
    if (this._mapContext) {
      this._mapContext.currentTool = null
    }
  }
}
