<template>
  <div class="arcgis-map-wrapper">
    <arcgis-map
      ref="mapElement"
      basemap="streets-vector"
      :center="center.join(',')"
      :zoom="zoom"
    >
      <arcgis-graphics-layer ref="graphicsLayerElement"></arcgis-graphics-layer>
    </arcgis-map>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

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
  zoom: 11
});

const emit = defineEmits<{
  (e: 'map-ready', map: any): void;
  (e: 'polygon-click', data: PolygonData): void;
}>();

const mapElement = ref<any>();
const graphicsLayerElement = ref<any>();

// WKT MULTIPOLYGON 转换为 ArcGIS Polygon
const parseWKTMultiPolygon = (wkt: string): number[][][] => {
  // 移除 "MULTIPOLYGON(((" 和 ")))"
  const coordsText = wkt
    .replace(/MULTIPOLYGON\s*\(\(\(/i, '')
    .replace(/\)\)\)/g, '')
    .trim();

  // 分割多个多边形
  const polygons = coordsText.split(')),((');

  const result: number[][][] = [];

  polygons.forEach(polyText => {
    const rings = polyText.split('),(');
    const polyRings: number[][] = [];

    rings.forEach(ring => {
      const points = ring.split(',').map(point => {
        const [lon, lat] = point.trim().split(/\s+/).map(Number);
        return [lon, lat];
      });
      polyRings.push(points);
    });

    result.push(polyRings);
  });

  return result;
};

// 添加多边形到地图
const addPolygonGraphics = async () => {
  if (!mapElement.value || !graphicsLayerElement.value) return;

  try {
    // 等待地图加载完成
    await mapElement.value.arcgisViewReadyChange;

    // 动态导入所需的ArcGIS模块
    const [Graphic, Polygon, SimpleFillSymbol, SimpleLineSymbol] = await Promise.all([
      import('@arcgis/core/Graphic.js').then(m => m.default),
      import('@arcgis/core/geometry/Polygon.js').then(m => m.default),
      import('@arcgis/core/symbols/SimpleFillSymbol.js').then(m => m.default),
      import('@arcgis/core/symbols/SimpleLineSymbol.js').then(m => m.default)
    ]);

    // 清空现有图形
    if (graphicsLayerElement.value.graphics) {
      graphicsLayerElement.value.graphics.removeAll();
    }

    // 添加所有多边形
    const graphics: any[] = [];
    props.polygons.forEach(data => {
      try {
        const rings = parseWKTMultiPolygon(data.polygon);

        rings.forEach((polyRings, index) => {
          const polygon = new Polygon({
            rings: polyRings,
            spatialReference: { wkid: 4326 }
          });

          const fillSymbol = new SimpleFillSymbol({
            color: [51, 122, 183, 0.3], // 半透明蓝色
            outline: new SimpleLineSymbol({
              color: [51, 122, 183],
              width: 2
            })
          });

          const graphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
            attributes: {
              id: data.id,
              name: data.name,
              index: index
            },
            popupTemplate: {
              title: '{name}',
              content: `<p>地块ID: {id}</p>`
            }
          });

          graphics.push(graphic);
        });
      } catch (error) {
        console.error('解析多边形数据失败:', data.id, error);
      }
    });

    // 批量添加图形
    if (graphics.length > 0 && graphicsLayerElement.value.graphics) {
      graphicsLayerElement.value.graphics.addMany(graphics);

      // 缩放到所有图形
      const view = mapElement.value.view;
      if (view && graphics.length > 0) {
        await view.goTo(graphics);
      }
    }
  } catch (error) {
    console.error('添加多边形失败:', error);
  }
};

// 定位到指定多边形
const locatePolygon = async (polygonId: string) => {
  if (!mapElement.value || !graphicsLayerElement.value) return;

  try {
    const view = mapElement.value.view;
    if (!view) return;

    // 查找对应的图形
    const graphics = graphicsLayerElement.value.graphics?.filter((g: any) =>
      g.attributes && g.attributes.id === polygonId
    );

    if (graphics && graphics.length > 0) {
      // 动态导入符号类
      const [SimpleFillSymbol, SimpleLineSymbol] = await Promise.all([
        import('@arcgis/core/symbols/SimpleFillSymbol.js').then(m => m.default),
        import('@arcgis/core/symbols/SimpleLineSymbol.js').then(m => m.default)
      ]);

      // 缩放到图形
      await view.goTo({
        target: graphics.toArray(),
        zoom: 15
      });

      // 高亮显示
      graphics.forEach((g: any) => {
        const highlightSymbol = new SimpleFillSymbol({
          color: [255, 165, 0, 0.5], // 橙色高亮
          outline: new SimpleLineSymbol({
            color: [255, 165, 0],
            width: 3
          })
        });
        g.symbol = highlightSymbol;
      });

      // 2秒后恢复原色
      setTimeout(() => {
        graphics.forEach((g: any) => {
          const normalSymbol = new SimpleFillSymbol({
            color: [51, 122, 183, 0.3],
            outline: new SimpleLineSymbol({
              color: [51, 122, 183],
              width: 2
            })
          });
          g.symbol = normalSymbol;
        });
      }, 2000);
    }
  } catch (error) {
    console.warn('定位失败:', error);
  }
};

// 清空所有图形
const clearGraphics = () => {
  if (graphicsLayerElement.value && graphicsLayerElement.value.graphics) {
    graphicsLayerElement.value.graphics.removeAll();
  }
};

// 暴露方法给父组件
defineExpose({
  locatePolygon,
  clearGraphics,
  updatePolygons: addPolygonGraphics,
  getView: () => mapElement.value?.view,
  getMap: () => mapElement.value?.map
});

onMounted(async () => {
  if (!mapElement.value) return;

  try {
    // 等待地图加载完成
    await mapElement.value.arcgisViewReadyChange;

    // 触发地图就绪事件
    emit('map-ready', mapElement.value.view);

    // 添加点击事件监听
    const view = mapElement.value.view;
    if (view) {
      view.on('click', async (event: any) => {
        const response = await view.hitTest(event);
        const result = response.results.find(
          (r: any) => r.graphic && r.graphic.layer === graphicsLayerElement.value
        );

        if (result && result.graphic.attributes) {
          const polygonData = props.polygons.find(
            p => p.id === result.graphic.attributes.id
          );
          if (polygonData) {
            emit('polygon-click', polygonData);
          }
        }
      });
    }

    // 初始化加载多边形
    await nextTick();
    addPolygonGraphics();
  } catch (error) {
    console.error('地图初始化失败:', error);
  }
});

// 监听polygons变化
watch(() => props.polygons, () => {
  addPolygonGraphics();
}, { deep: true });
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
