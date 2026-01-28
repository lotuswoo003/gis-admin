<template>
  <div class="arcgis-map-wrapper">
    <arcgis-map ref="mapElement">
    </arcgis-map>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, shallowRef } from "vue";
import "@arcgis/map-components/components/arcgis-map";
import config from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import Polygon from "@arcgis/core/geometry/Polygon";
import Polyline from "@arcgis/core/geometry/Polyline";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import wellknown from "wellknown";
import { ARCGIS_API_KEY } from "@/config/settings";
import TiandituLayerFactory from "@/components/map-resources/baselayers";
// 设置 ArcGIS API Key
config.apiKey = ARCGIS_API_KEY;
// 样式常量
const POLYGON_STYLE = {
  fillColor: [51, 122, 183, 0.5] as const, // 提高透明度到 0.5，更容易看到
  outlineColor: [255, 0, 0, 1] as const, // 改为红色边框，更明显
  outlineWidth: 3, // 加粗边框
  zoom: 15,
} as const;

// 选中状态样式
const SELECTED_POLYGON_STYLE = {
  fillColor: [255, 255, 0, 0.6] as const, // 黄色高亮填充
  outlineColor: [255, 165, 0, 1] as const, // 橙色边框
  outlineWidth: 4, // 更粗的边框
} as const;

const SPATIAL_REFERENCE = { wkid: 4326 } as const;

interface PolygonData {
  id?: string;
  name?: string;
  polygon?: string; // WKT格式的MULTIPOLYGON字符串
  [key: string]: any; // 允许其他属性
}

interface Props {
  polygons?: PolygonData[];
  center?: [number, number]; // [经度, 纬度]
  zoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
  polygons: () => [],
  center: () => [120.5, 31.3], // 苏州默认中心点
  zoom: 11,
});

const emit = defineEmits<{
  (e: "map-ready", map: any): void;
  (e: "polygon-click", data: PolygonData): void;
  (e: "polygon-dblclick", data: PolygonData): void;
  (e: "right-click", event: { x: number; y: number; screenPoint: any; mapPoint: any; graphic?: any; data?: PolygonData }): void;
  (e: "selection-change", data: PolygonData[]): void;
}>();

const mapElement = shallowRef<any>(null);
let graphicsLayer: GraphicsLayer | null = null;
let sketchLayer: GraphicsLayer | null = null;
let sketchViewModel: SketchViewModel | null = null;
const selectedGraphics: Graphic[] = []; // 当前选中的graphic列表
let currentTool: any = null;

// 事件系统
const eventHandlers: Record<string, Array<{ handler: Function; context?: any }>> = {};

const on = (event: string, handler: Function, context?: any) => {
  if (!eventHandlers[event]) {
    eventHandlers[event] = [];
  }
  eventHandlers[event].push({ handler, context });
};

const off = (event: string, handler: Function) => {
  if (eventHandlers[event]) {
    eventHandlers[event] = eventHandlers[event].filter(h => h.handler !== handler);
  }
};

const emitEvent = (event: string, ...args: any[]) => {
  if (eventHandlers[event]) {
    eventHandlers[event].forEach(({ handler, context }) => {
      handler.apply(context, args);
    });
  }
};

// 发出选中变更事件
const emitSelectionChange = () => {
  const dataList = selectedGraphics
    .map(g => props.polygons.find(p => p.id === g.attributes?.id))
    .filter((d): d is PolygonData => !!d);
  emit("selection-change", dataList);
  emitEvent("selection-changed", selectedGraphics);
};

// 清除选中
const clearSelection = () => {
  selectedGraphics.forEach(g => {
    g.symbol = createPolygonSymbol();
  });
  selectedGraphics.length = 0;
  emitSelectionChange();
};

// 获取 MapContext
const getMapContext = () => {
  return {
    view: mapElement.value?.view || null,
    sketchViewModel,
    graphicsLayer,
    sketchLayer,
    selectedGraphics,
    currentTool,
    on,
    off,
    emit: emitEvent,
    clearSelection,
    emitSelectionChange,
  };
};

// 创建多边形符号
const createPolygonSymbol = () =>
  new SimpleFillSymbol({
    color: POLYGON_STYLE.fillColor,
    outline: new SimpleLineSymbol({
      color: POLYGON_STYLE.outlineColor,
      width: POLYGON_STYLE.outlineWidth,
    }),
  });

// 创建选中状态的多边形符号
const createSelectedPolygonSymbol = () =>
  new SimpleFillSymbol({
    color: SELECTED_POLYGON_STYLE.fillColor,
    outline: new SimpleLineSymbol({
      color: SELECTED_POLYGON_STYLE.outlineColor,
      width: SELECTED_POLYGON_STYLE.outlineWidth,
    }),
  });

// 从WKT数据创建图形
const createGraphicFromData = (data: PolygonData): Graphic | null => {
  // 检查必需的数据
  if (!data.polygon || !data.id) {
    console.warn('跳过无效的多边形数据:', data);
    return null;
  }

  // 使用 wellknown 将 WKT 转换为 GeoJSON
  const geojson = wellknown(data.polygon);

  if (!geojson) {
    throw new Error(`无效的 WKT 格式: ${data.polygon}`);
  }

  let rings: number[][][] = [];

  if (geojson.type === "MultiPolygon") {
    // MultiPolygon: coordinates 是三维数组 [[[ring1], [ring2]], [[ring3]]]
    // 需要拍平成二维数组 [[ring1], [ring2], [ring3]]
    rings = geojson.coordinates.flat();
  } else if (geojson.type === "Polygon") {
    // Polygon: coordinates 是二维数组 [[ring1], [ring2]]
    // 直接使用
    rings = geojson.coordinates;
  } else {
    throw new Error(`不支持的几何类型: ${geojson.type}`);
  }

  const polygon = new Polygon({
    rings: rings,
    spatialReference: SPATIAL_REFERENCE,
  });

  return new Graphic({
    geometry: polygon,
    symbol: createPolygonSymbol(),
    attributes: {
      id: data.id,
      name: data.name,
    }
  });
};

// 添加多边形到地图
const addPolygonGraphics = async () => {
  if (!mapElement.value || !graphicsLayer) return;

  try {
    await mapElement.value.viewOnReady();

    // 清空现有图形和选中状态
    graphicsLayer.removeAll();
    selectedGraphics.length = 0;

    // 创建所有图形
    const allGraphics: Graphic[] = [];
    for (const data of props.polygons) {
      try {
        const graphic = createGraphicFromData(data);
        if (graphic) {
          allGraphics.push(graphic);
        }
      } catch (error) {
        console.error("解析多边形数据失败:", data.id, error);
      }
    }

    // 批量添加图形并缩放
    if (allGraphics.length > 0) {
      graphicsLayer.addMany(allGraphics);

      const view = mapElement.value.view;
      if (view) {
        // 使用更明确的参数来定位
        await view.goTo({
          target: allGraphics,
          zoom: 15
        }, {
          duration: 1000
        });
      }
    }
  } catch (error) {
    console.error("添加多边形失败:", error);
  }
};

// 定位到指定多边形
const locatePolygon = async (polygonId: string) => {
  const view = mapElement.value?.view;

  if (!view || !graphicsLayer) return;

  try {
    const targetGraphics = graphicsLayer.graphics.filter(
      (g: any) => g.attributes?.id === polygonId,
    );

    if (targetGraphics.length > 0) {
      await view.goTo({
        target: targetGraphics.toArray(),
        zoom: POLYGON_STYLE.zoom,
      });
    }
  } catch (error) {
    console.warn("定位失败:", error);
  }
};

// 清空所有图形
const clearGraphics = () => {
  graphicsLayer?.removeAll();
  selectedGraphics.length = 0;
};

// 获取当前选中的数据列表
const getSelectedData = (): PolygonData[] => {
  return selectedGraphics
    .map(g => props.polygons.find(p => p.id === g.attributes?.id))
    .filter((d): d is PolygonData => !!d);
};

// 创建多边形地块（面型）
const createPolygonLandmass = (): Promise<Graphic | null> => {
  return new Promise((resolve) => {
    if (!sketchViewModel || !sketchLayer) {
      resolve(null);
      return;
    }

    const createHandler = sketchViewModel.on("create", (event) => {
      if (event.state === "complete") {
        const graphic = event.graphic;
        graphic.symbol = createPolygonSymbol();
        createHandler.remove();
        resolve(graphic);
      }
    });

    sketchViewModel.layer = sketchLayer;
    sketchViewModel.create("polygon");
  });
};

// 创建线型地块
const createLineLandmass = (): Promise<Graphic | null> => {
  return new Promise((resolve) => {
    if (!sketchViewModel || !sketchLayer) {
      resolve(null);
      return;
    }

    const createHandler = sketchViewModel.on("create", (event) => {
      if (event.state === "complete") {
        const lineGraphic = event.graphic;
        // 将线转换为缓冲区多边形（简化版本，宽度50米）
        const buffered = geometryEngine.buffer(lineGraphic.geometry, 50, "meters") as Polygon;
        const polygonGraphic = new Graphic({
          geometry: buffered,
          symbol: createPolygonSymbol(),
        });

        // 移除线graphic，添加多边形graphic
        sketchLayer?.remove(lineGraphic);
        sketchLayer?.add(polygonGraphic);

        createHandler.remove();
        resolve(polygonGraphic);
      }
    });

    sketchViewModel.layer = sketchLayer;
    sketchViewModel.create("polyline");
  });
};

// 切割地块
const cutLandmass = (): Promise<Graphic[] | null> => {
  return new Promise((resolve) => {
    if (!sketchViewModel || !sketchLayer || selectedGraphics.length === 0) {
      resolve(null);
      return;
    }

    const createHandler = sketchViewModel.on("create", (event) => {
      if (event.state === "complete") {
        const cutter = event.graphic.geometry as Polyline;
        const targetGraphic = selectedGraphics[0]; // 切割第一个选中的

        try {
          const cutResults = geometryEngine.cut(targetGraphic.geometry as Polygon, cutter);

          if (cutResults && cutResults.length >= 2) {
            const resultGraphics = cutResults.map(geom => {
              return new Graphic({
                geometry: geom,
                symbol: createPolygonSymbol(),
              });
            });

            // 移除绘制的线
            sketchLayer?.remove(event.graphic);

            createHandler.remove();
            resolve(resultGraphics);
          } else {
            createHandler.remove();
            resolve(null);
          }
        } catch (error) {
          console.error("切割失败:", error);
          createHandler.remove();
          resolve(null);
        }
      }
    });

    sketchViewModel.layer = sketchLayer;
    sketchViewModel.create("polyline");
  });
};

// 合并地块
const mergeLandmass = (): Promise<Graphic | null> => {
  return new Promise((resolve) => {
    if (selectedGraphics.length < 2) {
      resolve(null);
      return;
    }

    try {
      const geometries = selectedGraphics.map(g => g.geometry as Polygon);
      const unioned = geometryEngine.union(geometries) as Polygon;

      if (unioned) {
        const mergedGraphic = new Graphic({
          geometry: unioned,
          symbol: createPolygonSymbol(),
        });

        resolve(mergedGraphic);
      } else {
        resolve(null);
      }
    } catch (error) {
      console.error("合并失败:", error);
      resolve(null);
    }
  });
};

// 取消当前绘图
const cancelDrawing = () => {
  if (sketchViewModel) {
    sketchViewModel.cancel();
  }
};

// 暴露方法给父组件
defineExpose({
  locatePolygon,
  clearGraphics,
  clearSelection,
  getSelectedData,
  updatePolygons: addPolygonGraphics,
  createPolygonLandmass,
  createLineLandmass,
  cutLandmass,
  mergeLandmass,
  cancelDrawing,
  getMapContext,
  getView: () => mapElement.value?.view,
  getMap: () => mapElement.value?.map,
});

// 设置地图点击事件监听
const setupClickListener = (view: any) => {
  view.on("click", async (event: any) => {
    const response = await view.hitTest(event);
    const result = response.results.find(
      (r: any) => r.graphic?.layer === graphicsLayer,
    );

    // 检测修饰键
    const isMultiSelect = event.native?.shiftKey || event.native?.ctrlKey || event.native?.metaKey;

    if (result?.graphic?.attributes) {
      const clickedGraphic = result.graphic;

      if (isMultiSelect) {
        // 多选模式：切换选中状态
        const existingIndex = selectedGraphics.indexOf(clickedGraphic);
        if (existingIndex !== -1) {
          // 已选中，取消选中
          clickedGraphic.symbol = createPolygonSymbol();
          selectedGraphics.splice(existingIndex, 1);
        } else {
          // 未选中，添加到选中列表
          clickedGraphic.symbol = createSelectedPolygonSymbol();
          selectedGraphics.push(clickedGraphic);
        }
      } else {
        // 单选模式：清除其他选中，只选当前
        if (!selectedGraphics.includes(clickedGraphic)) {
          selectedGraphics.forEach(g => {
            g.symbol = createPolygonSymbol();
          });
          selectedGraphics.length = 0;

          clickedGraphic.symbol = createSelectedPolygonSymbol();
          selectedGraphics.push(clickedGraphic);
        }
        // 如果点击的是已选中的且只有一个，保持选中
      }

      emitSelectionChange();

      const polygonData = props.polygons.find(
        (p) => p.id === result.graphic.attributes.id,
      );
      if (polygonData) {
        emit("polygon-click", polygonData);
      }
    } else {
      // 点击空白区域，取消所有选中
      selectedGraphics.forEach(g => {
        g.symbol = createPolygonSymbol();
      });
      selectedGraphics.length = 0;
      emitSelectionChange();
    }
  });
};

// 设置地图双击事件监听
const setupDblClickListener = (view: any) => {
  view.on("double-click", async (event: any) => {
    // 阻止默认的双击缩放行为
    event.stopPropagation();

    const response = await view.hitTest(event);
    const result = response.results.find(
      (r: any) => r.graphic?.layer === graphicsLayer,
    );

    if (result?.graphic?.attributes) {
      const clickedGraphic = result.graphic;

      // 双击切换为单选该graphic
      selectedGraphics.forEach(g => {
        g.symbol = createPolygonSymbol();
      });
      selectedGraphics.length = 0;

      clickedGraphic.symbol = createSelectedPolygonSymbol();
      selectedGraphics.push(clickedGraphic);
      emitSelectionChange();

      const polygonData = props.polygons.find(
        (p) => p.id === result.graphic.attributes.id,
      );
      if (polygonData) {
        emit("polygon-dblclick", polygonData);
      }
    }
  });
};

// 设置地图右键点击事件监听
const setupRightClickListener = (view: any) => {
  view.on("pointer-down", async (event: any) => {
    // 检查是否是右键点击 (button === 2)
    if (event.button !== 2) return;

    // 阻止默认行为和冒泡
    event.stopPropagation();
    if (event.native) {
      event.native.preventDefault();
      event.native.stopPropagation();
    }

    const response = await view.hitTest(event);
    const result = response.results.find(
      (r: any) => r.graphic?.layer === graphicsLayer,
    );

    let polygonData: PolygonData | undefined;
    if (result?.graphic?.attributes) {
      polygonData = props.polygons.find(
        (p) => p.id === result.graphic.attributes.id,
      );
    }

    // 使用 native 事件获取正确的浏览器坐标
    const clientX = event.native?.clientX || event.x;
    const clientY = event.native?.clientY || event.y;

    emit("right-click", {
      x: clientX,
      y: clientY,
      screenPoint: event.screenPoint,
      mapPoint: event.mapPoint,
      graphic: result?.graphic,
      data: polygonData,
    });
  });

  // 阻止浏览器默认右键菜单
  const container = view.container;
  if (container) {
    container.addEventListener("contextmenu", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }
};

onMounted(async () => {
  if (!mapElement.value) return;

  try {
    // 创建图形层
    graphicsLayer = new GraphicsLayer({
      id: 'polygon-graphics-layer',
    });

    // 创建绘图层
    sketchLayer = new GraphicsLayer({
      id: 'sketch-layer',
    });

    // 设置天地图底图
    const baseLayers = TiandituLayerFactory.getBasemap(
      (localStorage.getItem('BASE-LAYER-TYPE') as 'image' | 'vector') || 'image'
    );

    const map = new Map({
      basemap: {
        baseLayers: baseLayers,
      },
    });

    // 添加图形层到地图
    map.add(graphicsLayer);
    map.add(sketchLayer);

    // 设置地图
    mapElement.value.map = map;

    // 等待视图准备就绪
    await mapElement.value.viewOnReady();

    const view = mapElement.value.view;
    // 清空默认UI组件
    if (view) {
      view.ui.components = [];
    }

    // 初始化 SketchViewModel
    if (view && sketchLayer) {
      sketchViewModel = new SketchViewModel({
        view: view,
        layer: sketchLayer,
        defaultCreateOptions: {
          mode: "click",
        },
        defaultUpdateOptions: {
          tool: "reshape",
          enableRotation: false,
          enableScaling: false,
        },
      });

      // 监听绘图事件
      sketchViewModel.on("create", (event) => {
        if (event.state === "complete") {
          emitEvent("graphic-created", event.graphic);
        }
        if (event.state === "active") {
          emitEvent("graphic-drawed", event.graphic);
        }
      });

      sketchViewModel.on("update", (event) => {
        if (event.state === "active") {
          emitEvent("graphic-editing", event.graphics[0]);
        }
      });
    }

    emit("map-ready", view);

    if (view) {
      setupClickListener(view);
      setupDblClickListener(view);
      setupRightClickListener(view);
    }

    await nextTick();
    addPolygonGraphics();
  } catch (error) {
    console.error("地图初始化失败:", error);
  }
});

// 监听polygons变化
watch(() => props.polygons, addPolygonGraphics, { deep: true });
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
