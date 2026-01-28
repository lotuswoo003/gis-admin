import type Graphic from '@arcgis/core/Graphic'
import Geometry from '@arcgis/core/geometry/Geometry'
import type MapContext from '.'
const MAX_STACK_SIZE = 10
export default class OperationStack {
  pos: number //-1~n-1
  stack: any[]
  mapCtx: MapContext
  constructor(mapCtx: any) {
    this.stack = []
    this.pos = -1
    this.mapCtx = mapCtx
  }
  push(operation: Operation) {
    this.stack = this.stack.slice(0, this.pos + 1)
    if (this.stack.length >= MAX_STACK_SIZE) {
      this.stack.splice(0, this.stack.length - MAX_STACK_SIZE + 1)
    }

    this.stack.push(operation)
    this.pos = this.stack.length - 1
    this.mapCtx.emit('operate')
  }
  pop() {
    return this.stack.pop()
  }

  canUndo() {
    return this.pos >= 0
  }
  undo() {
    if (!this.canUndo()) return
    this.mapCtx.emit('operate')
    let operation = this.stack[this.pos]
    this.pos -= 1
    operation.undoAction(this.mapCtx)
  }
  canRedo() {
    return this.pos < this.stack.length - 1
  }
  redo() {
    if (!this.canRedo()) return
    this.mapCtx.emit('operate')
    let operation = this.stack[this.pos + 1]
    this.pos += 1
    if (this.pos >= this.stack.length) this.pos = this.stack.length - 1
    operation.redoAction(this.mapCtx)
  }
  clear() {
    this.stack = []
  }
  getStack() {
    return this.stack
  }
}
export enum ModifyType {
  add,
  delete,
  change,
  replace
}

export class Operation {
  private _modifyType: ModifyType
  private _origin: string
  private _deletedGraphics: Graphic[]
  private _addedGraphics: Graphic[]

  private _changedGraphics: Array<{
    graphic: Graphic
    before: { attrs: any; geometry: Geometry }
    after: { attrs: any; geometry: Geometry }
  }>

  constructor(options: any) {
    this._modifyType = options.modifyType
    this._origin = options.origin
    this._deletedGraphics = options.deleted || []
    this._addedGraphics = options.added || []
    this._changedGraphics = options.change || []
  }

  undoAction(mapCtx:MapContext) {
    this._addedGraphics.forEach((graphic) => {
      // mapCtx.delete(graphic)
      mapCtx.getDataLayer(graphic.attributes.type).removeFeature(graphic)
    })
    this._deletedGraphics.forEach((graphic) => {
      mapCtx.getDataLayer(graphic.attributes.type).addFeature(graphic)
    })

    this._changedGraphics.forEach((item) => {
      item.graphic.geometry = item.before.geometry
      if (!item.before.attrs) return
      for (const key of Object.keys(item.before.attrs)) {
        item.graphic.attributes[key] = item.before.attrs[key]
      }
    })
  }

  redoAction(mapCtx:MapContext) {
    this._addedGraphics.forEach((graphic) => {
      mapCtx.getDataLayer(graphic.attributes.type).addFeature(graphic)
    })
    this._deletedGraphics.forEach((graphic) => {
      // mapCtx.delete(graphic)
      mapCtx.getDataLayer(graphic.attributes.type).removeFeature(graphic)
    })

    this._changedGraphics.forEach((item) => {
      item.graphic.geometry = item.after.geometry
      for (const key of Object.keys(item.after.attrs)) {
        item.graphic.attributes[key] = item.after.attrs[key]
      }
    })
  }

  destroy() {}
}
