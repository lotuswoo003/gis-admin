import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
interface MapContextListener {
  remove: () => void
}

export enum HeatMapLayerType {
  Track = 'Track', //轨迹热力图
}
interface HeatMapLayer {
  id?: string //图层ID
  type: HeatMapLayerType //图层类型
  name?: string //图层名称
  visible?: boolean //是否可见
  layer?: FeatureLayer //ArcGIS JS API 图层对象
  mapCtx?: MapContext //地图上下文
}
//图层类型
export enum LayerType {
  Boundary = 'Boundary', //行政区划
  Extent = 'Extent', //范围
  Mass = 'Mass', //地块
  PreMass = 'PreMass', //预选地块--对应v3中自定义图层
  Custom = 'Custom', //自定义图层
  Sketch = 'Sketch', //草图
  Search = 'Search', //搜索
  Staff = 'Staff', //人员
  Track = 'Track', //轨迹
  Image = 'Image', //图片
  TimelineImage = 'TimelineImage', //时间轴图片
  Assets = 'Assets', //资产
  RoadNet = 'RoadNet', //道路网
  Count = 'Count', //统计
  Hover = 'Hover', //hover
  Warning = 'Warning', //预警
  Typhoon = 'Typhoon', //台风
  Location = 'Location', //定位
  Inspection = 'Inspection', //巡检
  Measure = 'Measure', //量算
  Car = 'Car', //车辆
  CarTrack = 'CarTrack', //车辆轨迹
  AssetsStatScope = 'AssetsStatScope', //资产统计范围
  AssetsStatResult = 'AssetsStatResult', //资产统计
  Ai = 'Ai', //AI
}

export enum subTypes {
  airport = 'airport',
  uav = 'uav',
  airline_point = 'airline_point',
  airline = 'airline',
  inspect_image = 'InspectionImage',
}

export enum MapLayoutType {
  Normal = 'normal', //正常布局
  Split = 'split', //分屏布局
  Swipe = 'swipe', //卷帘布局
}
interface DataLayer {
  id?: string //图层ID
  type: LayerType //图层类型
  name?: string //图层名称
  visible?: boolean //是否可见
  layer?: GraphicsLayer //ArcGIS JS API 图层对象
  searchable?: boolean //是否可搜索
  addFeature: (feature: __esri.Graphic, options?: { type?: LayerType }) => void //添加图形方法
  addFeatures: (features: __esri.Graphic[]) => void //添加图形方法
  removeFeature: (feature: __esri.Graphic) => void //移除图形方法
  clearFeatures: () => void //清除所有图形方法
  mapCtx?: MapContext //地图上下文
  getFeatureById: (id: string) => __esri.Graphic | null //通过ID获取图形方法
  removeFeatureById: (id: string) => void //通过ID移除图形方法
  removeSubType: (subType: subTypes) => void //通过子类型移除图形方法
  removeAllExcept: (subType: subTypes) => void //通过子类型移除所有图形方法
  
}

export interface IMapTool {
  readonly name: string //工具名称
  readonly enabled: boolean //是否启用
  create: (mapContext: MapContext | null) => void //创建时调用
  startAction?: (cbk?: (event: any) => any) => void //开始操作时调用
  execute?: (cbk?: (event: any) => any) => void //执行操作时调用
  destroy: () => void //销毁时调用
}
