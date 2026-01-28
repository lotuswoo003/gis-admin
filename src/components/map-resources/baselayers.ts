import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import esriRequest from '@arcgis/core/request'

const TK = 'b0bf1521709b14ca51b6076cfc5b71d0'

const SUBDOMAINS = ['0', '1', '2', '3', '4', '5', '6', '7']

//天地图矢量图
export const VECTOR_MAP =
  'https://t{subDomain}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  TK

//天地图矢量注记
export const VECTOR_MARK =
  'https://t{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  TK

//天地图影像图
export const IMAGE_MAP =
  'https://t{subDomain}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  TK

//天地图影像注记
export const IMAGE_MARK =
  'https://t{subDomain}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
  TK

export const GEOSERVER_URL = import.meta.env.VITE_GEOSERVER_URL

//@ts-ignore
export const TDTWebTileLayer = WebTileLayer.createSubclass({
  properties: {
    urlTemplate: null,
  },
  getTileUrl: function (level: any, row: any, col: any) {
    return this.urlTemplate
      .replace('{subDomain}', SUBDOMAINS[(col + row) % SUBDOMAINS.length])
      .replace('{z}', level)
      .replace('{x}', col)
      .replace('{y}', row)
  },
  fetchTile: function (level: any, row: any, col: any, options: any) {
    if (level <= 18) {
      const url = this.getTileUrl(level, row, col)
      return esriRequest(url, {
        responseType: 'image',
        signal: options && options.signal,
      }).then((response) => response.data)
    } else {
      const pow = Math.pow(2, level - 18)
      const newRow = Math.floor(row / pow)
      const newCol = Math.floor(col / pow)
      const url = this.getTileUrl(18, newRow, newCol)
      return esriRequest(url, {
        responseType: 'image',
        signal: options && options.signal,
      }).then((response) => {
        const originSize = this.tileInfo.size[0]
        const originRow = newRow * pow
        const originCol = newCol * pow
        const size = originSize / pow
        const originX = (col - originCol) * size
        const originY = (row - originRow) * size
        const canvas = document.createElement('canvas')
        canvas.width = originSize
        canvas.height = originSize
        const context = canvas.getContext('2d')
        context!.drawImage(
          response.data,
          originX,
          originY,
          size,
          size,
          0,
          0,
          originSize,
          originSize,
        )
        return canvas
      })
    }
  },
})

export default class TiandituLayerFactory {
  static createVectorLayer() {
    return new TDTWebTileLayer({
      id: 'tianditu-vector',
      urlTemplate: VECTOR_MAP,
      subDomains: SUBDOMAINS,
      title: '天地图矢量底图',
    })
  }
  static createVectorMarkLayer() {
    return new TDTWebTileLayer({
      id: 'tianditu-vector-mark',
      urlTemplate: VECTOR_MARK,
      subDomains: SUBDOMAINS,
      title: '天地图矢量注记',
    })
  }
  static createImageLayer() {
    return new TDTWebTileLayer({
      id: 'tianditu-image',
      urlTemplate: IMAGE_MAP,
      subDomains: SUBDOMAINS,
      title: '天地图影像底图',
    })
  }
  static createImageMarkLayer() {
    return new TDTWebTileLayer({
      id: 'tianditu-image-mark',
      urlTemplate: IMAGE_MARK,
      subDomains: SUBDOMAINS,
      title: '天地图影像注记',
    })
  }

  static createVectorGroupLayer() {
    return [TiandituLayerFactory.createVectorLayer(), TiandituLayerFactory.createVectorMarkLayer()]
  }

  static createImageGroupLayer() {
    return [TiandituLayerFactory.createImageLayer(), TiandituLayerFactory.createImageMarkLayer()]
  }

  static switchBaseLayer(baseLayers: __esri.Collection<__esri.Layer>, type: 'image' | 'vector' = 'image') {

    if(type==='image'){
        const baseLayerIndex = baseLayers.findIndex(layer=>layer.id==='tianditu-vector')
        const markLayerIndex = baseLayers.findIndex(layer=>layer.id==='tianditu-vector-mark')
        const baseLayer = baseLayers.at(baseLayerIndex) as WebTileLayer
        baseLayer.id = 'tianditu-image'
        baseLayer.urlTemplate=IMAGE_MAP
        baseLayer.title='天地图影像底图'
        baseLayer.refresh()
        const markLayer = baseLayers.at(markLayerIndex) as WebTileLayer
        markLayer.id='tianditu-image-mark'
        markLayer.urlTemplate=IMAGE_MARK
        markLayer.title='天地图影像底图注记'
        markLayer.refresh()
    }
    else{
        const baseLayerIndex = baseLayers.findIndex(layer=>layer.id==='tianditu-image')
        const markLayerIndex = baseLayers.findIndex(layer=>layer.id==='tianditu-image-mark')
        const baseLayer = baseLayers.at(baseLayerIndex) as WebTileLayer
        baseLayer.id = 'tianditu-vector'
        baseLayer.urlTemplate=VECTOR_MAP
        baseLayer.title='天地图矢量底图'
        baseLayer.refresh()
        const markLayer = baseLayers.at(markLayerIndex) as WebTileLayer
        markLayer.id='tianditu-vector-mark'
        markLayer.urlTemplate=VECTOR_MARK
        markLayer.title='天地图矢量底图注记'
        markLayer.refresh()
    }
    
  }

  static getBasemap = (type: 'image' | 'vector' = 'image') => {
    return type === 'vector'
      ? TiandituLayerFactory.createVectorGroupLayer()
      : TiandituLayerFactory.createImageGroupLayer()
  }
}
