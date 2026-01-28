import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import Graphic from '@arcgis/core/Graphic'
import { parse, stringify } from 'wellknown'
import {
  webMercatorToGeographic,
  geographicToWebMercator,
} from '@arcgis/core/geometry/support/webMercatorUtils'
import type { GeometryUnion } from '@arcgis/core/unionTypes'

export function defer() {
  let resolve
  let reject
  const promise = new Promise(function (res, rej) {
    resolve = res
    reject = rej
  })

  return {
    resolve: resolve,
    reject: reject,
    promise: promise,
  }
}


/**
 *
 * @param polygon graphic.geometry
 */
export const polygonToWkt = (polygon: any, isMercator = true) => {
  let rings = polygon.rings
  if (isMercator || polygon.spatialReference.isWebMercator) {
    //墨卡托转经纬度
    const geo = webMercatorToGeographic(polygon) as any
    rings = geo.rings
  }
  return geoToWkt({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      //@ts-ignore
      coordinates: rings,
    },
  })
}

//Geo转WKT
export const geoToWkt = (geo: any) => {
  return stringify(geo)
}

//WKT转Geo
export const wktToGeo = (wkt: string) => {
  return parse(wkt)
}