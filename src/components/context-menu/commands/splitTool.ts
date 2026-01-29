import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils'
import Polyline from '@arcgis/core/geometry/Polyline'
import * as cutOperator from '@arcgis/core/geometry/operators/cutOperator.js'
import { uuid } from '@/utils/commonUtil'
import type MapContext from '@/components/map-context'
import { LayerType, type DataLayer, type IMapTool } from '@/components/map-context/types.d'
import Graphic from '@arcgis/core/Graphic'
import type { Polygon } from '@arcgis/core/geometry'
import { ElMessage, ElMessageBox } from 'element-plus'
export default class splitTool implements IMapTool {
  private _name = 'SplitTool'
  private _mapContext: MapContext | null = null
  private _cbk?: (event: any) => any = () => {}
  private _editingGraphic: Graphic | null = null
  constructor() {}

  get name(): string {
    return this._name
  }

  get enabled() {
    return !!this._mapContext?.mapSelected.find((item) => item.attributes?.type === LayerType.Mass)
  }
  create(mapContext: MapContext | null): void {
    this._mapContext = mapContext
    if (!this._mapContext || !this._mapContext.sketchManager) {
      throw new Error('MapContext is not initialized or sketch manager null.')
    }
    if (this._mapContext.currentTool !== this) {
      this._mapContext.currentTool && this._mapContext.currentTool.destroy()
      this._mapContext.currentTool = this
      this._mapContext.on('graphic-editing', this.handleEditing, this)
      this._mapContext.on('graphic-drawed', this.handleCreated, this)
    }
  }

  async startAction(cbk?: (event: any) => any): Promise<void> {
    this._cbk = cbk
    if (!this._mapContext || !this._mapContext.sketchManager) return

    this._mapContext.sketchManager.sketch.creationMode = 'single'
    this._mapContext.sketchManager.sketch.create('polyline', { mode: 'click' })
  }

  handleEditing(graphic: Graphic) {
    if ((graphic?.geometry as any).paths[0].length > 2) {
      this._mapContext?.sketchManager?.sketch.complete()
    }
  }

  async handleCreated(graphic: Graphic) {
    if (!this._mapContext) return
    if (!this._cbk) return

    // const cutter = new Polyline({
    //   paths: graphic.geometry?.paths || [],
    // })
    const cutter = webMercatorToGeographic(graphic.geometry) as Polyline
    const graphicsTarget = [
      ...this._mapContext.mapSelected.filter((item) => item.attributes?.type === LayerType.Mass),
    ]
    const sourceGraphics = []
    const resultsGraphics: any[] = []
    for (const graphicTarget of graphicsTarget) {
      //   const wgs84Geo = webMercatorToGeographic(graphic.geometry)
      const results = cutOperator.execute(graphicTarget.geometry as Polygon, cutter)
      if (results.length >= 2) {
        sourceGraphics.push(graphicTarget)
        resultsGraphics.push(
          ...results.map((geom) =>
            createCutResultGraphic(
              this._mapContext!,
              { sourceId: graphicTarget.attributes.id, id: uuid('block') },
              geom,
            ),
          ),
        )
      }
    }

    // 提交到后台
    const res = await this._cbk({
      action: 'split',
      sourceGraphics,
      resultsGraphics,
    })
    if (res.code !== 0) {
      ElMessage.error('地块拆分失败')
      console.log('---地块拆分失败---', res)
      return
    }

    res.data.forEach((item: any, index: number) => {
      resultsGraphics[index].attributes.id = item
    })
    sourceGraphics.forEach(async (graphic) => {
      this._mapContext?.getDataLayer(LayerType.Mass)?.removeFeature(graphic)
    })
    this._mapContext?.getDataLayer(LayerType.Mass)?.addFeatures(resultsGraphics)
  }

  destroy() {
    this._mapContext?.off('graphic-drawed', this.handleCreated)
    this._mapContext?.off('graphic-editing', this.handleEditing)
  }
}

function createCutResultGraphic(mapCtx: MapContext, attrs = {}, geom: any): Graphic {
  const graphic = new Graphic({
    geometry: geom,
    symbol: mapCtx.getSymbol(LayerType.Mass, 'normal'),
    attributes: {
      ...attrs,
      type: LayerType.Mass,
      interop: true,
    },
  })
  // graphic.geometry = geographicToWebMercator(graphic.geometry)
  // graphic.spatialReference.wkid = 3857
  return graphic
}
