import type MapContext from '.'
import type { DataLayer, LayerType, subTypes } from './types'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import { createGraphic, wktToGeo,createOtherGraphic } from '@/components/map'
export default class GraphicDataLayer implements DataLayer {
  id?: string | undefined
  type: LayerType
  name?: string | undefined
  visible?: boolean | undefined
  opacity?: number | undefined
  url?: string | undefined
  layer?: __esri.GraphicsLayer | undefined
  searchable?: boolean | undefined
  mapCtx?: MapContext | undefined

  constructor(options: { type: LayerType; [key: string]: any }) {
    this.id = options.id
    this.type = options.type
    this.name = options.name
    this.visible = options.visible ?? true
    this.layer = options.layer || new GraphicsLayer()
    this.searchable = options.searchable ?? true
  }

  addFeature(feature: __esri.Graphic, attrs: any = {}): void {
    if (this.layer) {
      if (!feature.attributes) feature.attributes = attrs
      else if (Object.keys(attrs).length > 0) {
        feature.attributes = { ...feature.attributes, ...attrs }
      }
      !feature.attributes.type && (feature.attributes.type = attrs?.type ?? this.type)
      this.layer.add(feature)
    } else {
      console.warn('Layer is not defined')
    }
  }
  addFeatures(features: __esri.Graphic[], attrs: any = {}): void {
    if (this.layer) {
      features.forEach((feature) => {
        if (!feature.attributes) feature.attributes = attrs
        else if (Object.keys(attrs).length > 0) {
          feature.attributes = { ...feature.attributes, ...attrs }
        }
        feature.attributes.type = attrs?.type ?? this.type
      })
      this.layer.addMany(features)
    } else {
      console.warn('Layer is not defined')
    }
  }
  removeFeature(feature: __esri.Graphic): void {
    if (this.layer && feature) {
      this.mapCtx?.unSelect(feature)
      this.layer.remove(feature)
    } else {
      console.warn('Layer is not defined')
    }
  }
  getFeatureById(id: string): __esri.Graphic | null {
    if (this.layer) {
      const features = this.layer.graphics.filter((item) => item.attributes.id === id)
      return features.length > 0 ? (features.getItemAt(0) ?? null) : null
    } else {
      console.warn('Layer is not defined')
      return null
    }
  }
  removeFeatureById(id: string): void {
    const graphic = this.getFeatureById(id)
    if (graphic) this.layer?.remove(graphic)
  }
  clearFeatures(): void {
    if (this.layer) {
      this.mapCtx!.setMapSelectedSet(
        this.mapCtx!.mapSelected.filter((item) => item.layer !== this.layer),
      )
      this.layer.removeAll()
      this.mapCtx?.emit('clear-layer', this.type)
    } else {
      console.warn('Layer is not defined')
    }
  }

  removeSubType(subType: subTypes) {
    if (this.layer) {
      const features = this.layer.graphics
        .filter((item) => item.attributes.type === subType)
        .toArray()
      this.layer.removeMany(features)
    } else {
      console.warn('Layer is not defined')
    }
  }
  removeAllExcept(subType: subTypes) {
    if (this.layer) {
      const features = this.layer.graphics
        .filter((item) => item.attributes.type !== subType)
        .toArray()
      this.layer.removeMany(features)
    } else {
      console.warn('Layer is not defined')
    }
  }
}
