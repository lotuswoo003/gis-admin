import {
  webMercatorToGeographic,
  lngLatToXY,
  xyToLngLat,
} from '@arcgis/core/geometry/support/webMercatorUtils'
import Polygon from '@arcgis/core/geometry/Polygon'
export function convertPolygonsToGeoJson(polygons: Array<any>, isWebMercator = true) {
  let geoJson: any = {
    type: 'MultiPolygon',
    coordinates: [],
  }

  if (isWebMercator && polygons) {
    polygons = polygons.map((polygon) => webMercatorToGeographic(polygon))
  }
  geoJson.coordinates = !polygons
    ? []
    : polygons.map((polygon) => {
        let ring = polygon.rings[0]
        ring.forEach((point: any) => point.length === 3 && point.pop())
        return [ring]
      })
  return geoJson
}

//根据路径往两边扩充成多边形
export const generateRingsByPaths = (paths: [], extent: number, isMercator = false) => {
  //转成web墨卡托坐标,经纬度容易掉精度
  const mercatorPath = !isMercator ? paths.map((item) => lngLatToXY(item[0], item[1])) : paths

  const path1 = []
  const path2 = []
  for (let i = 0; i < paths.length; i++) {
    //前一个点
    const p1 = mercatorPath[i - 1]
    //当前点
    const p2 = mercatorPath[i]
    //后一个点
    const p3 = mercatorPath[i + 1]

    //以p2为原点,计算向量
    let v1, v2
    if (p1) v1 = [p1[0] - p2[0], p1[1] - p2[1]]
    else v1 = [p2[0] - p3[0], p2[1] - p3[1]]

    if (p3) v2 = [p3[0] - p2[0], p3[1] - p2[1]]
    else v2 = [p2[0] - p1[0], p2[1] - p1[1]]

    //计算v1,v2的模
    const v1Mod = Number(Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]))
    const v2Mod = Number(Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]))

    //计算v1的单位向量
    const v1Unit = [v1[0] / v1Mod, v1[1] / v1Mod]
    //计算v2的单位向量
    const v2Unit = [v2[0] / v2Mod, v2[1] / v2Mod]

    //计算v2的逆时针单位法向量
    const v2Normal = [-v2Unit[1], v2Unit[0]]

    let num = Number(((v1[0] * v2[0] + v1[1] * v2[1]) / (v1Mod * v2Mod)).toFixed(8))
    if (num !== 1 && num !== -1) {
      //计算向量的夹角
      const radius = Math.acos(num)
      //计算沿v2方向的扩展距离
      const d = extent / Math.tan(radius / 2)
      const f =
        (v2Unit[0] * v1Unit[1] - v2Unit[1] * v1Unit[0]) /
          (v1Unit[0] * v2Unit[0] + v1Unit[1] * v2Unit[1]) >
        0
      const v3 = [v2Unit[0] - v1Unit[0], v2Unit[1] - v1Unit[1]]
      const v3Mod = Number(Math.sqrt(v3[0] * v3[0] + v3[1] * v3[1]))
      const g = v3Mod > Math.SQRT2
      let quadrant = 1
      if (f) {
        if (g) quadrant = 3
        else quadrant = 1
      } else {
        if (g) quadrant = 2
        else quadrant = 4
      }
      const h = quadrant === 1 || quadrant === 2 ? 1 : -1 //核心

      const v12 = [(h * (v1Unit[0] + v2Unit[0])) / 2, (h * (v1Unit[1] + v2Unit[1])) / 2]
      const v12Mod = Number(Math.sqrt(v12[0] * v12[0] + v12[1] * v12[1]))

      const v12Unit = [v12[0] / v12Mod, v12[1] / v12Mod]
      const p2_1 = [p2[0] + (v12Unit[0] * d) / v12Mod, p2[1] + (v12Unit[1] * d) / v12Mod]

      //v2单位向量*d加上v2Normal2向量*extent
      const p1_2 = [p2[0] * 2 - p2_1[0], p2[1] * 2 - p2_1[1]]
      path1.push(p2_1)
      path2.push(p1_2)
    } else {
      const p2_1 = [p2[0] + v2Normal[0] * extent, p2[1] + v2Normal[1] * extent]
      const p1_2 = [p2[0] * 2 - p2_1[0], p2[1] * 2 - p2_1[1]]
      path1.push(p2_1)
      path2.push(p1_2)
    }
  }
  path2.reverse()

  //将web墨卡托坐标转成经纬度
  if (isMercator) {
    return [[...path1, ...path2, path1[0]]]
  }

  const pathsNew = [...path1, ...path2, path1[0]].map((item) => {
    return xyToLngLat(item[0], item[1])
  })
  return [pathsNew]
}


export const bufferRings = (ring:any, r:number) => {
  const mercatorRing = [...ring]
  mercatorRing.pop()
  const bufPath = []
  for (let i = 0; i < mercatorRing.length; i++) {
    //前一个点
    let p1 = mercatorRing[i - 1]
    //当前点
    const p2 = mercatorRing[i]
    //后一个点
    let p3 = mercatorRing[i + 1]
    if (!p1) {
      p1 = mercatorRing[mercatorRing.length - 1]
    }
    if (!p3) {
      p3 = mercatorRing[0]
    }
    //以p2为原点,计算向量
    const v1 = [p1[0] - p2[0], p1[1] - p2[1]]
    const v2 = [p3[0] - p2[0], p3[1] - p2[1]]

    //计算v1,v2的模
    const v1Mod = Number(Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]))
    const v2Mod = Number(Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]))

    //计算v1的单位向量
    const v1Unit = [v1[0] / v1Mod, v1[1] / v1Mod]
    //计算v2的单位向量
    const v2Unit = [v2[0] / v2Mod, v2[1] / v2Mod]

    //计算v2的逆时针单位法向量
    const v2Normal = [-v2Unit[1], v2Unit[0]]

    let num = Number(((v1[0] * v2[0] + v1[1] * v2[1]) / (v1Mod * v2Mod)).toFixed(8))
    if (num !== 1 && num !== -1) {
      //计算向量的夹角
      const radius = Math.acos(num)
      //计算沿v2方向的扩展距离
      const d = r / Math.tan(radius / 2)
      const f =
        (v2Unit[0] * v1Unit[1] - v2Unit[1] * v1Unit[0]) /
          (v1Unit[0] * v2Unit[0] + v1Unit[1] * v2Unit[1]) >
        0
      const v3 = [v2Unit[0] - v1Unit[0], v2Unit[1] - v1Unit[1]]
      const v3Mod = Number(Math.sqrt(v3[0] * v3[0] + v3[1] * v3[1]))
      const g = v3Mod > Math.SQRT2
      let quadrant = 1
      if (f) {
        if (g) quadrant = 3
        else quadrant = 1
      } else {
        if (g) quadrant = 2
        else quadrant = 4
      }
      const h = quadrant === 1 || quadrant === 2 ? 1 : -1 //核心

      const v12 = [(h * (v1Unit[0] + v2Unit[0])) / 2, (h * (v1Unit[1] + v2Unit[1])) / 2]
      const v12Mod = Number(Math.sqrt(v12[0] * v12[0] + v12[1] * v12[1]))

      const v12Unit = [v12[0] / v12Mod, v12[1] / v12Mod]
      const p2_1 = [p2[0] + (v12Unit[0] * d) / v12Mod, p2[1] + (v12Unit[1] * d) / v12Mod]

      bufPath.push(p2_1)
    } else {
      const p2_1 = [p2[0] + v2Normal[0] * r, p2[1] + v2Normal[1] * r]

      bufPath.push(p2_1)
    }
  }

  const pathsNew = [...bufPath, bufPath[0]]
  return [pathsNew]
}
