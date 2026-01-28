
import { convertPolygonsToGeoJson } from '@/components/map/map-context/utils/geo-utils'
import { ElMessage } from 'element-plus'
import { Operation, ModifyType } from '@/components/map/map-context/OperationStack'
import type MapContext from '@/components/map/map-context'
import { LayerType, type DataLayer, type IMapTool } from '@/components/map/map-context/types.d'
import Graphic from '@arcgis/core/Graphic'
export default class editTool implements IMapTool {
  private _name = 'EditTool'
  private _mapContext: MapContext | null = null
  private _cbk?: (event: any) => any = () => {}
  private _editingGraphic: Graphic | null = null
  constructor() {

  }

  get name(): string {
    return this._name
  }
  get mapContext() {
    return this._mapContext
  }

  get enabled() {
    return !!this._mapContext?.mapSelected.find((item) => item.attributes?.type === LayerType.Mass || item.attributes?.type === LayerType.Extent)
  }
  create(mapContext: MapContext | null): void {
    this._mapContext = mapContext
    if (!this._mapContext || !this._mapContext.sketchManager) {
      throw new Error('MapContext is not initialized or sketch manager null.')
    }
    if (this._mapContext.currentTool !== this) {
      this._mapContext.currentTool && this._mapContext.currentTool.destroy()
      this._mapContext.currentTool = this
      this._mapContext.on('graphic-updated', this.handleUpdated, this)
    }

  }
  async startAction(cbk?: (event: any) => any): Promise<void>  {
    if (!this._mapContext || !this._mapContext.sketchManager) return
    this._cbk = cbk
    let graphic = this._mapContext?.mapSelected.find((item) => item.attributes?.type === LayerType.Mass|| item.attributes?.type === LayerType.Extent)
    if(!graphic) return
    this._editingGraphic = graphic
    graphic = graphic.clone()
    this._editingGraphic.visible = false
    this._mapContext.sketchManager.sketch.layer.graphics.add(graphic)
    this._mapContext.sketchManager.sketch.update(graphic)

  }

  async handleUpdated(graphic:Graphic) {
    if(!this._editingGraphic) return
    console.log('---handleUpdated---', graphic)
    if(!this._cbk) return
    const res = await this._cbk({action:'update',graphic})
    if(res.code !== 0){
      ElMessage.error('地块更新失败')
      this._editingGraphic.visible = true
      return
    }

    this._editingGraphic.geometry = graphic.geometry?.clone()
    this._editingGraphic.visible = true
    if (graphic?.attributes?.type === LayerType.Extent) {
    //   retCode = await this.updateExtent(graphic)
    } else if (graphic?.attributes?.type === LayerType.Mass) {
    //   retCode = await this.updateLandmass(graphic)
    }
  }


  destroy() {
    this._mapContext?.off('graphic-updated', this.handleUpdated)
  }
}
