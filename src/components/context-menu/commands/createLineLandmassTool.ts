import { generateRingsByPaths } from '@/components/map-context/utils/geo-utils'
import { ElMessage } from 'element-plus'
import { Operation, ModifyType } from '@/components/map-context/OperationStack'
import type MapContext from '@/components/map-context'
import { LayerType, type DataLayer, type IMapTool } from '@/components/map-context/types.d'
import Graphic from '@arcgis/core/Graphic'

export default class createLineLandmassTool implements IMapTool {
  private _name = 'CreateLineLandmassTool'
  private _mapContext: MapContext | null = null
  private _cbk?: (event: any) => any = () => {}
  private _drawingGraphic: Graphic | null = null
  private _mouseWheelListener: __esri.Handle | null = null
  constructor() {

  }

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
      this._mapContext.on('graphic-drawed', this.handleDrawed, this)
      this._mapContext.on('graphic-created', this.handleCreated, this)
      this._mapContext.on('graphic-editing', this.handleEditing, this)
    }
  }

  async startAction(cbk?: (event: any) => any): Promise<void> {
    if (!this._mapContext || !this._mapContext.sketchManager) return
    this._cbk = cbk
    this._drawingGraphic = null

    this._mapContext.sketchManager.sketch.creationMode = 'update'
    this._mapContext.sketchManager.sketch.create('polyline', { mode: 'click' })
  }

  async handleDrawed(graphic: Graphic) {
    if (!this._mapContext || !this._mapContext.sketchManager) return
    this._drawingGraphic = createLandMassByLine(this._mapContext!, graphic, 50)
    console.log('---handleDrawed---', this._drawingGraphic)
    this._mouseWheelListener = this._mapContext!.mapView?.on(
      'mouse-wheel',
      this.handleMouseWheel.bind(this),
    )
  }
  handleMouseWheel(event: any) {
    if (!this._drawingGraphic) return
    const keys = {
      ctrl: event.native.ctrlKey,
      alt: event.native.altKey,
      shift: event.native.shiftKey
    }
    if (keys.shift) {
      event.stopPropagation()
    }

    const halfWidth = clampRoadWidth(
      event,
      this._drawingGraphic.attributes.extraInfo?.halfWidth ?? 50,
    )
    this._drawingGraphic.attributes.extraInfo.halfWidth = halfWidth
    const path = this._drawingGraphic.attributes.extraInfo.roadPath
    this._drawingGraphic.geometry =  createLandMassGeoByPath(path, halfWidth)
  }

  handleEditing(graphic: Graphic) {
    if (!this._mapContext || !this._mapContext.sketchManager) return
    if (!this._drawingGraphic) return
    const halfWidth = this._drawingGraphic.attributes.extraInfo?.halfWidth ?? 50
    const {geometry,path} = createLandMassGeoByLine(graphic, halfWidth)
    this._drawingGraphic.geometry = geometry
    this._drawingGraphic.attributes.extraInfo.roadPath = path
  }
  async handleCreated(graphic: Graphic) {
    if (!this._mapContext || !this._mapContext.sketchManager ||!this._drawingGraphic) return
    if(!this._cbk) return
    const res = await this._cbk({action:'create',graphic:this._drawingGraphic})
    if(res.code !== 0){
      ElMessage.error('地块添加失败')
      this._mapContext.getDataLayer(LayerType.Mass)?.removeFeature(this._drawingGraphic)
    }
    this._drawingGraphic = null
    this._mouseWheelListener?.remove()
    this._mouseWheelListener= null

  }

  destroy() {
    this._mapContext?.off('graphic-drawed', this.handleDrawed)
    this._mapContext?.off('graphic-created', this.handleCreated)
  }
}

function clampRoadWidth(event: any, halfWidth: number) {
  if (event.deltaY > 0) {
    //缩小
    halfWidth -= 2
    halfWidth = halfWidth < 10 ? 10 : halfWidth
  } else {
    //放大
    halfWidth += 2
    halfWidth = halfWidth > 200 ? 200 : halfWidth
  }

  return halfWidth
}

function createLandMassGeoByPath(path:any, halfWidth: number = 50): any {
  // const path = (lineGraphic.geometry as any).paths[0]
  const rings = generateRingsByPaths(path, halfWidth, true)

    return {
      type: 'polygon',
      rings: rings,
      spatialReference: {
        wkid: 3857,
      },
    }
}

function createLandMassGeoByLine(lineGraphic: Graphic, halfWidth: number = 50): any {
  const path = (lineGraphic.geometry as any).paths[0]
  return {
    geometry: createLandMassGeoByPath(path, halfWidth),
    path
  }
}
function createLandMassByLine(mapCtx: MapContext, lineGraphic: Graphic, halfWidth: number = 50) {
  const path = (lineGraphic.geometry as any).paths[0]
  const rings = generateRingsByPaths(path, halfWidth, true)
  const extraInfo = {
    roadPath: path,
    halfWidth,
  }
  let attrs = {
    type: LayerType.Mass,
    interop: true,
    date: Date.now(),
    extraInfo,
  }
  let mainGraphic = createLineLandMassGraphic(mapCtx, attrs, rings)
  mapCtx.getDataLayer(LayerType.Mass)?.addFeature(mainGraphic)
  return mainGraphic
}

function createLineLandMassGraphic(mapCtx: MapContext, attrs = {}, rings: any) {
  const graphic = new Graphic({
    geometry: {
      type: 'polygon',
      rings: rings,
      spatialReference: {
        wkid: 3857,
      },
    },
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
