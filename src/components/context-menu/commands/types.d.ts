import type Graphic from '@arcgis/core/Graphic'
import type SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel'
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import type MapView from '@arcgis/core/views/MapView'

export interface IMapTool {
  name: string
  enabled: boolean
  create(context: IMapContext): void
  startAction?(callback?: (event: any) => any): Promise<void>
  execute?(callback?: (event: any) => any): Promise<void>
  destroy(): void
}

export interface IMapContext {
  view: MapView | null
  sketchViewModel: SketchViewModel | null
  graphicsLayer: GraphicsLayer | null
  sketchLayer: GraphicsLayer | null
  selectedGraphics: Graphic[]
  currentTool: IMapTool | null

  on(event: string, handler: Function, context?: any): void
  off(event: string, handler: Function): void
  emit(event: string, ...args: any[]): void
  clearSelection(): void
  emitSelectionChange(): void
}
