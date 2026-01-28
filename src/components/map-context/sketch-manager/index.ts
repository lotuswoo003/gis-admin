import Sketch from '@arcgis/core/widgets/Sketch'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapContext from '..'
export default class SketchManager {
  private _sketch: Sketch
  private _sketchLayer: GraphicsLayer
  private _createEvent?: IHandle
  private _updateEvent?: IHandle
  private _mapCtx: MapContext

  get sketch() {
    return this._sketch
  }
  constructor(ctx: MapContext) {
    this._mapCtx = ctx
    this._sketchLayer = new GraphicsLayer()
    this._mapCtx.map.add(this._sketchLayer)
    this._sketch = new Sketch({
      view: this._mapCtx.mapView,
      layer: this._sketchLayer,
      creationMode: 'update',
      defaultCreateOptions: {
        hasZ: false,
      },
      defaultUpdateOptions: {
        tool: 'reshape',
        toggleToolOnClick: false,
        enableZ: false
      }
    })
    this.initEvents()
    
  }

  initEvents() {
    this._createEvent = this._sketch.on('create', (event: any) => {
      if (event.state === 'complete') {
        this._mapCtx.emit('graphic-drawed', event.graphic)
        if (this._sketch.creationMode === 'single') this._sketch.layer.removeAll()
      }else if (event.state === 'active') {
        this._mapCtx.emit('graphic-editing', event.graphic)
      }
    })
    this._updateEvent = this._sketch.on('update', (event: any) => {
      if (event.state === 'complete') {
        console.log('---sketch update complete---', event)
        try {
          if (!event.graphics[0].attributes?.type) this._mapCtx.emit('graphic-created', event.graphics[0])
          else this._mapCtx.emit('graphic-updated', event.graphics[0])
        } catch (e) {
          console.log('---create or delete graphic failed---', e)
        }
        this._sketch.layer.removeAll()
      } else if (event.state === 'start') {
      } else if (event.state === 'active') {
        this._mapCtx.emit('graphic-editing', event.graphics[0])
      }
    })
  }

  public destroy() {
    this._createEvent?.remove()
    this._updateEvent?.remove()
    this._sketch.destroy()
  }


  startSelectDrawAction(type?:String) {
    this._sketch.creationMode = 'single'
    const geomType = type==='lasso'?'polygon':'rectangle'
    const mode = type==='lasso'?'freehand':'click'
    this._sketch.create(geomType, { mode })
  }
  stopDrawAction() {
    this._sketch.cancel()
  }

}