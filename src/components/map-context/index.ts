import type MapView from '@arcgis/core/views/MapView'
import EventBus from './event-bus'
import SketchManager from './sketch-manager'
import { debounce } from 'lodash'
import type {
  DataLayer,
  MapContextListener,
  IMapTool,
  HeatMapLayerType,
  HeatMapLayer,
} from './types'
import { LayerType } from './types.d'
import GraphicDataLayer from './data-layer'

import type Graphic from '@arcgis/core/Graphic'
import symbols,{subTypesSymbols} from './symbols'
import OperationStack from './OperationStack'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'

export function isMultiSelect(event: MouseEvent): boolean {
  return event.shiftKey || event.ctrlKey || event.metaKey
}

async function hitTestOnMoving(mapCtx: MapContext, event: __esri.MapViewScreenPoint | MouseEvent) {
  const hitRes = await mapCtx.mapView.hitTest(event)
  const hitItems =
    hitRes.results.length > 0
      ? hitRes.results
          .filter((item: any) => item.graphic?.attributes?.interop)
          .map((item) => (item as __esri.MapViewGraphicHit).graphic)
      : []
  mapCtx.emit('feature-hover', event, hitItems)
}

function stashSymbol(graphic: Graphic) {
  if (graphic?.attributes.unique_symbol) {
    graphic.attributes.storeSymbol = graphic.symbol
  }
}
function restoreSymbol(graphic: Graphic) {
  graphic?.attributes?.unique_symbol && (graphic.symbol = graphic.attributes.storeSymbol)
}

/**
 * 地图相关的基础状态和方法
 */
export default class MapContext {
  private eventBus: EventBus = new EventBus()
  private _mapView: MapView
  private _map: __esri.Map
  private _sketchManager?: SketchManager
  private _pointerMoveEvent?: IHandle
  private _clickEvent?: IHandle
  private _dblClickEvent?: IHandle
  private _keyBoardEvents?: IHandle
  private _hitTestOnMovingDebounce?: Function
  private _mapStyle: 'image' | 'vector' = 'image'
  private _center: __esri.Point //地图原始中心点
  //   private _operationStack: OperationStack
  private _layers: Map<LayerType, DataLayer> = new Map()

  private _mapSelected: __esri.Graphic[] = []
  public currentTool: IMapTool | null = null
  private _operationStack: OperationStack

  constructor(view: MapView) {
    this._mapView = view
    this._map = view.map!
    this._center = this._mapView.center.clone()
    this._operationStack = new OperationStack(this)
    this.init()
  }

  get mapView() {
    return this._mapView
  }
  get map() {
    return this._map
  }
  get operationStack() {
    return this._operationStack
  }
  get mapStyle() {
    return this._mapStyle
  }
  get layers() {
    return this._layers
  }
  get mapSelected() {
    return this._mapSelected
  }
  /**
   * 只设置选中graphics,不改变颜色
   * @param features 选中的Graphics
   */
  setMapSelectedSet(features: __esri.Graphic[]) {
    this._mapSelected = features
  }
  set mapStyle(style: 'image' | 'vector') {
    this._mapStyle = style
  }

  get sketchManager() {
    return this._sketchManager
  }
  init() {
    this._sketchManager = new SketchManager(this)
    this.initMapEvents()
  }

  on(eventName: string, callback: Function, scope?: any): MapContextListener {
    return this.eventBus.on(eventName, callback, scope)
  }
  once(eventName: string, callback: Function): void {
    return this.eventBus.once(eventName, callback)
  }
  emit(eventName: string, ...args: any[]): void {
    return this.eventBus.emit(eventName, ...args)
  }
  off(eventName: string, callback?: Function): void {
    return this.eventBus.off(eventName, callback)
  }

  initMapEvents() {
    this.initPointerMoveEvents()
    this.initClickEvents()
    this.initDoubleClickEvents()
    this.initKeyBoardEvents()
    this.addListeners()
  }

  addListeners() {
    this.on('clear-layer', (layerType: LayerType) => {
      const clearedSelected = this._mapSelected.filter(
        (item: any) => item.attributes?.type === layerType,
      )
      if (clearedSelected.length !== this._mapSelected.length) {
        this._mapSelected = this._mapSelected.filter(
          (item: any) => item.attributes?.type !== layerType,
        )
        this.emit('selected-changed', { features: this._mapSelected.slice() })
      }
    })
  }
  initKeyBoardEvents() {}

  initPointerMoveEvents() {
    this._hitTestOnMovingDebounce = debounce(hitTestOnMoving, 200)
    this._pointerMoveEvent = this.mapView.on('pointer-move', async (event) => {
      this.emit('pointer-move', event)
      if (this._hitTestOnMovingDebounce) this._hitTestOnMovingDebounce(this, event)
    })
  }

  initClickEvents() {
    this._clickEvent = this.mapView.on('click', async (event) => {
      const hitRes = await this.mapView.hitTest(event)
      let hitted = false
      if (hitRes.results.length > 0) {
        const hitItems = hitRes.results
          .filter((item: any) => item.graphic?.attributes?.interop)
          .map((item) => (item as __esri.MapViewGraphicHit).graphic)
        if (hitItems.length > 0) {
          this.emit('feature-hit', event, hitItems)
          hitted = true
        }
      }
      if (!hitted && !isMultiSelect(event.native)) this.emit('feature-hit', event, [])

      if (event.button === 2) {
        this.emit('right-click', event)
      } else {
        this.emit('click', event)
      }
    })
  }

  initDoubleClickEvents() {
    this._dblClickEvent = this.mapView.on('double-click', async (event) => {
      const hitRes = await this.mapView.hitTest(event)
      let hitted = false
      if (hitRes.results.length > 0) {
        const hitItems = hitRes.results
          .filter((item: any) => item.graphic?.attributes?.interop)
          .map((item) => (item as __esri.MapViewGraphicHit).graphic)
        if (hitItems.length > 0) {
          this.emit('feature-hit', event, hitItems)
          hitted = true
        }
      }
      if (!hitted && !isMultiSelect(event.native)) this.emit('feature-hit', event, [])

      this.emit('dblClick', event)
    })
  }

  setCursor(cursor: string) {
    this._mapView!.container!.style.cursor = cursor
  }

  /**
   * 聚焦
   * @param target 目标
   * @returns
   */
  private _focus = debounce((target: any, zoom?: number) => {
    zoom !== undefined ? this.mapView!.goTo({ target, zoom }) : this.mapView!.goTo({ target })
  }, 500)

  focus(
    target:
      | LayerType
      | Graphic
      | Graphic[]
      | __esri.Geometry
      | __esri.Geometry[]
      | [number, number],
    zoom?: number,
  ): MapContext {
    if (typeof target === 'string') {
      const graphicLayer = this._layers.get(target)?.layer
      graphicLayer && this._focus(graphicLayer?.graphics, zoom)
    } else {
      this._focus(target, zoom)
    }
    return this
  }

  goToCenter = () => {
    this.mapView.goTo(
      {
        target: this._center,
        zoom: 5,
      },
      { duration: 0.1 },
    )
  }
  public destroy() {
    this._pointerMoveEvent?.remove()
    this._clickEvent?.remove()
    this._dblClickEvent?.remove()
    this._keyBoardEvents?.remove()
    this._sketchManager?.destroy()
    this.eventBus.clear()
  }

  isDataLayerVisible(layerType: LayerType): boolean {
    if (!this._layers.has(layerType)) return false
    return this._layers.get(layerType)?.layer?.visible ?? false
  }
  addDataLayer(layerType: LayerType): DataLayer {
    const layer = new GraphicDataLayer({ type: layerType })
    layer.mapCtx = this
    this._layers.set(layerType, layer)
    layer.layer && this._map.add(layer.layer)
    this.emit('layer-added', layer)
    return layer
  }

  getDataLayer(layerType: LayerType): DataLayer {
    if (this._layers.has(layerType)) return this._layers.get(layerType)!
    console.warn('new layer created,put it to init function', layerType)
    return this.addDataLayer(layerType)
  }
  selectLayerGraphics(layerType: LayerType, graphics: Graphic[]|null) {
    const dataLayer = this.getDataLayer(layerType)
    let selectedGraphics: Graphic[] = []
    if(!graphics){
      selectedGraphics=dataLayer.layer?.graphics.toArray()||[]
    }
    else selectedGraphics = graphics
    selectedGraphics = selectedGraphics.filter((graphic) => graphic.layer===dataLayer.layer )
    const selectedSymbol = this.getSymbol(layerType, 'select')
    selectedGraphics.forEach((graphic) => {
      if(!this.mapSelected.find((item) => item !== graphic)) {
        this.mapSelected.push(graphic)
        selectedSymbol && (graphic.symbol = selectedSymbol)
      }
    })
    if(selectedGraphics.length>0){
      this.emit('selected-changed', { features: this.mapSelected.slice() })
    }
  }
  select(graphic: Graphic, isMulti = false) {
    if (!graphic) return
    const selectedSymbol = this.getSymbol(graphic.attributes?.type, 'select') ?? graphic.symbol

    if (isMulti) {
      const graphic2 = this.mapSelected.find((item) => item === graphic)
      if (!graphic2) {
        this.mapSelected.push(graphic)
        //stashSymbol(graphic)
        selectedSymbol && (graphic.symbol = selectedSymbol)
        this.emit('selected-changed', { features: this.mapSelected.slice() })
      } else {
        this.unSelect(graphic2)
        const symbol = this.getSymbol(graphic.attributes?.type, 'normal')
        symbol && (graphic.symbol = symbol)
      }
    } else {
      this.unSelectAll(false)
      this._mapSelected = [graphic]
      //stashSymbol(graphic)
      selectedSymbol && (graphic.symbol = selectedSymbol)
      this.emit('selected-changed', { features: this.mapSelected.slice() })
    }
  }

  unSelectAll(emit = true) {
    this.mapSelected.forEach((item) => {
      const symbol = this.getSymbol(item.attributes.type, 'normal')
      symbol && (item.symbol = symbol)
      restoreSymbol(item)
    })
    this._mapSelected = []
    emit && this.emit('selected-changed', { features: this.mapSelected.slice() })
  }

  unSelect(graphic: Graphic) {
    if (!graphic) return
    let index = this.mapSelected.findIndex((item) => item === graphic)
    if (index > -1) {
      this.mapSelected.splice(index, 1)
      const symbol = this.getSymbol(graphic.attributes?.type, 'normal')
      symbol && (graphic.symbol = symbol)
      restoreSymbol(symbol)
      this.emit('selected-changed', { features: this.mapSelected.slice() })
    }
  }

  delete(graphic: Graphic) {
    this.unSelect(graphic)
    ;(graphic.layer as GraphicsLayer)?.remove(graphic)
  }

  /**
   *
   * @param type 图层类型
   * @param state nornmal | hover | select | selectFill | highlight
   * @returns
   */
  getSymbol(
    type: string,
    state: 'normal' | 'hover' | 'select' | 'selectFill' | 'highlight' = 'normal',
  ) {
    const symbol =
      symbols[type]?.[this.mapStyle]?.[state] || symbols[type]?.[state] || symbols[type] ||subTypesSymbols[type]

    if (!symbol) {
      console.warn(`Symbol for type "${type}" and state "${state}" not found.`)
      return null
    }
    return symbol
  }

  resetSymbolFromHover(graphic: Graphic) {
    const graphic2 = this.mapSelected.find((item) => item === graphic)
    let symbol
    if (graphic2) {
      symbol = this.getSymbol(graphic.attributes?.type, 'select')
    } else {
      symbol = this.getSymbol(graphic.attributes?.type, 'normal')
    }
    symbol && (graphic.symbol = symbol)
    restoreSymbol(graphic)
  }

  setSymbolToHover(graphic: Graphic) {
    // stashSymbol(graphic)
    // console.log('----setSymbolToHover----', graphic?.attributes)
    const hoverSymbol = this.getSymbol(graphic.attributes?.type, 'hover')
    if (hoverSymbol) {
      graphic.symbol = hoverSymbol
    } else {
      console.warn(`Hover symbol for type "${graphic.attributes?.type}" not found.`)
    }
  }
}
