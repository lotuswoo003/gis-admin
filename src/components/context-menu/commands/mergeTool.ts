import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils'
import * as bufferOperator from '@arcgis/core/geometry/operators/bufferOperator.js'
import * as unionOperator from '@arcgis/core/geometry/operators/unionOperator.js'
import * as simplifyOperator from "@arcgis/core/geometry/operators/simplifyOperator.js";
import { bufferRings } from '@/components/map-context/utils/geo-utils'
import { uuid } from '@/utils/commonUtil'
import type MapContext from '@/components/map-context'
import { LayerType, type DataLayer, type IMapTool } from '@/components/map-context/types.d'
import Graphic from '@arcgis/core/Graphic'
import Polygon from '@arcgis/core/geometry/Polygon'
import { ElMessage, ElMessageBox } from 'element-plus';

export default class mergeLandmassCommand implements IMapTool {
  private _name = 'MergeLandmassCommand'
  private _mapContext: MapContext | null = null
  private _cbk?: (event: any) => any = () => {}
  private _editingGraphic: Graphic | null = null
  constructor() {

  }

  get name(): string {
    return this._name
  }

  get enabled() {
    return this.getSelectedLandMassList().length >= 2
  }

  create(mapContext: MapContext | null): void {
    this._mapContext = mapContext
    if (!this._mapContext || !this._mapContext.sketchManager) {
      throw new Error('MapContext is not initialized or sketch manager null.')
    }
    if (this._mapContext.currentTool !== this) {
      this._mapContext.currentTool && this._mapContext.currentTool.destroy()
      this._mapContext.currentTool = this
    }

  }

  getSelectedLandMassList(): Array<Graphic> {
    return (
      this._mapContext?.mapSelected.filter((item) => item.attributes?.type === LayerType.Mass) || []
    )
  }

  async execute(cbk?:(event:any)=>any) {
    this._cbk = cbk
    const targetGraphics = this.getSelectedLandMassList()
    if (targetGraphics.length < 2) {
      console.log('---没有选中>2的图形---')
      return
    }
    if(!this._cbk) return

    const bufferedGeos = targetGraphics.map(
      //@ts-ignore
      (graphic) => new Polygon({ rings: bufferRings(graphic.geometry.rings[0], 200) }),
    )
    const unionGeo = unionOperator.executeMany(bufferedGeos)
    if ((unionGeo as any)?.rings.length > 1) {
      ElMessage.error('选中的地块距离太远不能合并')
      return
    }
    const finalGeo = new Polygon({
        //@ts-ignore
        rings: bufferRings(unionGeo.rings[0], -200),
        spatialReference: {
          wkid: 3857
        }
      })

    // const simplifyGeo = simplifyOperator.execute(finalGeo)
    const graphic = createMergeGeoGraphic(this._mapContext!, finalGeo, { id: uuid('block') })

    // 提交到后台
    const res = await this._cbk({action:'merge',sourceGraphics:targetGraphics,result:graphic})
    if(res.code !== 0){
      ElMessage.error('地块合并失败')
      return
    }
    graphic.attributes.id = res.data?.[0]
    this._mapContext?.getDataLayer(LayerType.Mass)?.addFeature(graphic)

    targetGraphics.forEach((graphic) => {
      this._mapContext?.getDataLayer(LayerType.Mass).removeFeature(graphic)
    })
  }

  destroy() {}
}

function createMergeGeoGraphic(mapCtx: MapContext, geom: any, attrs = {}): Graphic {
  const graphic = new Graphic({
    geometry: geom,
    symbol: mapCtx.getSymbol(LayerType.Mass, 'normal'),
    attributes: {
      ...attrs,
      type: LayerType.Mass,
      interop: true,
    },
  })

  return graphic
}
