<template>
  <div class="arcgis-map-wrapper">
    <arcgis-map ref="mapElement"> </arcgis-map>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick, shallowRef } from 'vue'
import '@arcgis/map-components/components/arcgis-map'
import config from '@arcgis/core/config'
import Map from '@arcgis/core/Map'
import Graphic from '@arcgis/core/Graphic'
import Polygon from '@arcgis/core/geometry/Polygon'
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol'
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol'
import wellknown from 'wellknown'
import { ARCGIS_API_KEY } from '@/config/settings'
import TiandituLayerFactory from '@/components/map-resources/baselayers'
import MapContext from '@/components/map-context'
import type { DataLayer } from '@/components/map-context/types.d'
import { LayerType } from '@/components/map-context/types.d'
import { useMapStore } from '@/store/map/map'
import symbols from './map-context/symbols'
// 设置 ArcGIS API Key
config.apiKey = ARCGIS_API_KEY
// 样式常量
const POLYGON_STYLE = {
  fillColor: [51, 122, 183, 0.5] as const, // 提高透明度到 0.5，更容易看到
  outlineColor: [255, 0, 0, 1] as const, // 改为红色边框，更明显
  outlineWidth: 3, // 加粗边框
  zoom: 15,
} as const

const mapStore = useMapStore()
const SPATIAL_REFERENCE = { wkid: 4326 } as const

interface PolygonData {
  id?: string
  name?: string
  polygon?: string // WKT格式的MULTIPOLYGON字符串
  [key: string]: any // 允许其他属性
}

interface Props {
  polygons?: PolygonData[]
  center?: [number, number] // [经度, 纬度]
  zoom?: number
  autoFit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  polygons: () => [],
  center: () => [120.5, 31.3], // 苏州默认中心点
  zoom: 11,
})
const emit = defineEmits<{
  (e: 'map-ready', map: any): void
  (e: 'polygon-click', data: PolygonData): void
  (e: 'polygon-dblclick', data: PolygonData): void
  (e: 'data-loaded'): void
  (
    e: 'right-click',
    event: {
      x: number
      y: number
      screenPoint: any
      mapPoint: any
      graphic?: any
      data?: PolygonData
    },
  ): void
  (e: 'selection-change', data: PolygonData[]): void
}>()

const mapElement = shallowRef<any>(null)
let landMassLayer: DataLayer | null = null
let mapContext: MapContext | null = null

// 清除选中
const clearSelection = () => {
  if (!mapContext) return
  mapContext.unSelectAll()
}

// 获取 MapContext
const getMapContext = () => {
  return mapContext
}


// 从WKT数据创建图形
const createGraphicFromData = (data: PolygonData): Graphic | null => {
  // 检查必需的数据
  if (!data.polygon || !data.id) {
    console.warn('跳过无效的多边形数据:', data)
    return null
  }

  // 使用 wellknown 将 WKT 转换为 GeoJSON
  const geojson = wellknown(data.polygon)

  if (!geojson) {
    throw new Error(`无效的 WKT 格式: ${data.polygon}`)
  }

  let rings: number[][][] = []

  if (geojson.type === 'MultiPolygon') {
    // MultiPolygon: coordinates 是三维数组 [[[ring1], [ring2]], [[ring3]]]
    // 需要拍平成二维数组 [[ring1], [ring2], [ring3]]
    rings = geojson.coordinates.flat()
  } else if (geojson.type === 'Polygon') {
    // Polygon: coordinates 是二维数组 [[ring1], [ring2]]
    // 直接使用
    rings = geojson.coordinates
  } else {
    throw new Error(`不支持的几何类型: ${geojson.type}`)
  }

  const polygon = new Polygon({
    rings: rings,
    spatialReference: SPATIAL_REFERENCE,
  })

  return new Graphic({
    geometry: polygon,
    symbol: mapContext.getSymbol(LayerType.Mass),
    attributes: {
      id: data.id,
      name: data.name,
      type: LayerType.Mass, // 添加类型标识，用于 MapContext
      interop: true, // 标记为可交互的 graphic
    },
  })
}

// 添加多边形到地图
const addPolygonGraphics = async () => {
  if (!mapElement.value || !landMassLayer?.layer) return

  try {
    await mapElement.value.viewOnReady()

    // 清空现有图形和选中状态
    landMassLayer?.layer?.removeAll()
    if (mapContext) {
      mapContext.setMapSelectedSet([])
    }

    // 创建所有图形
    const allGraphics: Graphic[] = []
    for (const data of props.polygons) {
      try {
        const graphic = createGraphicFromData(data)
        if (graphic) {
          allGraphics.push(graphic)
        }
      } catch (error) {
        console.error('解析多边形数据失败:', data.id, error)
      }
    }

    // 批量添加图形并缩放
    if (allGraphics.length > 0 && landMassLayer) {
      landMassLayer.addFeatures(allGraphics)

      const view = mapElement.value.view
      if (view && props.autoFit) {
        // 使用更明确的参数来定位
        await view.goTo(
          {
            target: allGraphics,
            zoom: 15,
          },
          {
            duration: 1000,
          },
        )
      }
    }

    emit('data-loaded')
  } catch (error) {
    console.error('添加多边形失败:', error)
  }
}

// 定位到指定多边形
const locatePolygon = async (polygonId: string) => {
  const view = mapElement.value?.view

  if (!view || !landMassLayer?.layer) return

  try {
    const targetGraphics = landMassLayer.layer.graphics.filter(
      (g: any) => g.attributes?.id === polygonId,
    )

    if (targetGraphics.length > 0) {
      await view.goTo({
        target: targetGraphics.toArray(),
        zoom: POLYGON_STYLE.zoom,
      })
    }
  } catch (error) {
    console.warn('定位失败:', error)
  }
}

// 清空所有图形
const clearGraphics = () => {
  landMassLayer?.layer?.removeAll()
  if (mapContext) {
    mapContext.setMapSelectedSet([])
  }
}

// 获取当前选中的数据列表
const getSelectedData = (): PolygonData[] => {
  if (!mapContext) return []
  return mapContext.mapSelected
    .map((g) => props.polygons.find((p) => p.id === g.attributes?.id))
    .filter((d): d is PolygonData => !!d)
}

// 暴露方法给父组件
defineExpose({
  locatePolygon,
  clearGraphics,
  clearSelection,
  getSelectedData,
  updatePolygons: addPolygonGraphics,
  getMapContext,
  getView: () => mapElement.value?.view,
  getMap: () => mapElement.value?.map,
})

// 设置地图事件监听
const setupMapEventListeners = () => {
  if (!mapContext || !landMassLayer) return

  // 监听 feature-hit 事件来触发业务层的 polygon-click
  mapContext.on('feature-hit', (event: any, items: Graphic[]) => {
    if (event.button === 2) return // 忽略右键

    // 查找属于 landMassLayer 的 graphic
    const clickedGraphic = items.find((g) => g.layer === landMassLayer?.layer)
    if (clickedGraphic?.attributes) {
      const polygonData = props.polygons.find((p) => p.id === clickedGraphic.attributes.id)
      if (polygonData) {
        emit('polygon-click', polygonData)
      }
    }
  })

  // 监听双击事件
  mapContext.on('dblClick', async (event: any) => {
    event.stopPropagation()

    const response = await mapContext!.mapView.hitTest(event)
    const result = response.results.find((r: any) => r.graphic?.layer === landMassLayer?.layer) as
      | __esri.MapViewGraphicHit
      | undefined

    if (result?.graphic?.attributes) {
      const polygonData = props.polygons.find((p) => p.id === result.graphic.attributes.id)
      if (polygonData) {
        emit('polygon-dblclick', polygonData)
      }
    }
  })

  // 监听右键点击事件
  mapContext.on('right-click', async (event: any) => {
    const response = await mapContext!.mapView.hitTest(event)
    const result = response.results.find((r: any) => r.graphic?.layer === landMassLayer?.layer) as
      | __esri.MapViewGraphicHit
      | undefined

    let polygonData: PolygonData | undefined
    if (result?.graphic?.attributes) {
      polygonData = props.polygons.find((p) => p.id === result.graphic.attributes.id)
    }

    const clientX = event.native?.clientX || event.x
    const clientY = event.native?.clientY || event.y

    emit('right-click', {
      x: clientX,
      y: clientY,
      screenPoint: event.screenPoint,
      mapPoint: event.mapPoint,
      graphic: result?.graphic,
      data: polygonData,
    })
  })

  // 监听 selected-changed 事件来触发业务层的 selection-change
  mapContext.on('selected-changed', (event: any) => {
    const selectedGraphics = event?.features || []
    const dataList = selectedGraphics
      .map((g: Graphic) => props.polygons.find((p) => p.id === g.attributes?.id))
      .filter((d: any): d is PolygonData => !!d)
    emit('selection-change', dataList)
  })

  // 阻止浏览器默认右键菜单
  const container = mapContext.mapView.container
  if (container) {
    container.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    })
  }
}

const initDataLayers = (mapContext: MapContext) => {
  mapContext.addDataLayer(LayerType.Hover)
  mapContext.addDataLayer(LayerType.Mass)

}
onMounted(async () => {
  if (!mapElement.value) return

  try {
    // 设置天地图底图
    const baseLayers = TiandituLayerFactory.getBasemap(
      (localStorage.getItem('BASE-LAYER-TYPE') as 'image' | 'vector') || 'image',
    )

    const map = new Map({
      basemap: {
        baseLayers: baseLayers,
      },
    })

    // 设置地图
    mapElement.value.map = map

    // 等待视图准备就绪
    await mapElement.value.viewOnReady()

    const view = mapElement.value.view
    // 清空默认UI组件
    if (view) {
      view.ui.components = []
    }

    // 创建 MapContext 实例
    if (view) {
      mapContext = new MapContext(view)
      mapStore.setMapContext(mapContext)
      initDataLayers(mapContext)
      landMassLayer = mapContext.getDataLayer(LayerType.Mass)
      mapContext.mapStyle = 'image'

      // 设置事件监听器
      setupMapEventListeners()
    }

    emit('map-ready', view)

    await nextTick()
    addPolygonGraphics()
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
})

// 监听polygons变化
watch(() => props.polygons, addPolygonGraphics, { deep: true })
</script>

<style scoped>
.arcgis-map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

arcgis-map {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
