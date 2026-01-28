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
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import wellknown from "wellknown";
import { ARCGIS_API_KEY } from "@/config/settings";
import TiandituLayerFactory from "@/components/map-resources/baselayers";
// 设置 ArcGIS API Key
config.apiKey = ARCGIS_API_KEY;
config.assetsPath = "./assets";
// 样式常量
const POLYGON_STYLE = {
  fillColor: [51, 122, 183, 0.3] as const,
  outlineColor: [51, 122, 183] as const,
  outlineWidth: 2,
  zoom: 15,
} as const;

const SPATIAL_REFERENCE = { wkid: 4326 } as const;

interface PolygonData {
  id: string;
  name: string;
  polygon: string; // WKT格式的MULTIPOLYGON字符串
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
}>();

const mapElement = shallowRef<any>(null);
const graphicsLayer = shallowRef<GraphicsLayer | null>(null);

// 创建多边形符号
const createPolygonSymbol = () =>
  new SimpleFillSymbol({
    color: POLYGON_STYLE.fillColor,
    outline: new SimpleLineSymbol({
      color: POLYGON_STYLE.outlineColor,
      width: POLYGON_STYLE.outlineWidth,
    }),
  });

// 从WKT数据创建图形
const createGraphicFromData = (data: PolygonData): Graphic[] => {
  // 使用 wellknown 将 WKT 转换为 GeoJSON
  const geojson = wellknown(data.polygon);

  if (!geojson || geojson.type !== "MultiPolygon") {
    throw new Error(`无效的 WKT 格式: ${data.polygon}`);
  }

  // GeoJSON MultiPolygon 的 coordinates 结构直接对应 ArcGIS 的 rings
  return geojson.coordinates.map((polygonCoords, index) => {
    const polygon = new Polygon({
      rings: polygonCoords,
      spatialReference: SPATIAL_REFERENCE,
    });

    return new Graphic({
      geometry: polygon,
      symbol: createPolygonSymbol(),
      attributes: {
        id: data.id,
        name: data.name,
        index,
      },
      popupTemplate: {
        title: "{name}",
        content: `<p>地块ID: {id}</p>`,
      },
    });
  });
};

// 添加多边形到地图
const addPolygonGraphics = async () => {
  if (!mapElement.value || !graphicsLayer.value) return;

  try {
    await mapElement.value.viewOnReady();

    // 清空现有图形
    graphicsLayer.value.removeAll();

    // 创建所有图形
    const allGraphics: Graphic[] = [];
    for (const data of props.polygons) {
      try {
        const dataGraphics = createGraphicFromData(data);
        allGraphics.push(...dataGraphics);
      } catch (error) {
        console.error("解析多边形数据失败:", data.id, error);
      }
    }

    // 批量添加图形并缩放
    if (allGraphics.length > 0) {
      graphicsLayer.value.addMany(allGraphics);

      const view = mapElement.value.view;
      if (view) {
        await view.goTo(allGraphics);
      }
    }
  } catch (error) {
    console.error("添加多边形失败:", error);
  }
};

// 定位到指定多边形
const locatePolygon = async (polygonId: string) => {
  const view = mapElement.value?.view;

  if (!view || !graphicsLayer.value) return;

  try {
    const targetGraphics = graphicsLayer.value.graphics.filter(
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
  graphicsLayer.value?.removeAll();
};

// 暴露方法给父组件
defineExpose({
  locatePolygon,
  clearGraphics,
  updatePolygons: addPolygonGraphics,
  getView: () => mapElement.value?.view,
  getMap: () => mapElement.value?.map,
});

// 设置地图点击事件监听
const setupClickListener = (view: any) => {
  view.on("click", async (event: any) => {
    const response = await view.hitTest(event);
    const result = response.results.find(
      (r: any) => r.graphic?.layer === graphicsLayer.value,
    );

    if (result?.graphic?.attributes) {
      const polygonData = props.polygons.find(
        (p) => p.id === result.graphic.attributes.id,
      );
      if (polygonData) {
        emit("polygon-click", polygonData);
      }
    }
  });
};

onMounted(async () => {
  if (!mapElement.value) return;

  try {
    // 创建图形层
    graphicsLayer.value = new GraphicsLayer();

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
    map.add(graphicsLayer.value);

    // 设置地图
    mapElement.value.map = map;

    // 等待视图准备就绪
    await mapElement.value.viewOnReady();

    const view = mapElement.value.view;
    // 清空默认UI组件
    if (view) {
      view.ui.components = [];
    }

    emit("map-ready", view);

    if (view) {
      setupClickListener(view);
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
