<template>
    <Transition name="fade">
      <div
        v-if="tooltipVisible && tooltipContent"
        class="feature-tooltip"
        :style="{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
        }"
      >
        <div class="tooltip-content">
          {{ tooltipContent }}
        </div>
      </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMapStore } from '@/store/map/map'
interface Props {
  visible?: boolean
  content?: string
  position?: { x: number; y: number }
}
defineOptions({ name: 'FeatureTooltip' })


// 悬浮提示状态
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipPosition = ref({ x: 0, y: 0 })
const mapStore = useMapStore()

// // 监听 hoverGraphic 变化，显示/隐藏 tooltip
// watch(hoverGraphic, (graphic) => {
//   if (graphic && graphic.attributes) {
//     // 查找对应的地块数据
//     const polygonData = props.polygons.find((p) => p.id === graphic.attributes.id)
//     if (polygonData?.name) {
//       tooltipContent.value = polygonData.name
//       tooltipVisible.value = true
//     } else {
//       tooltipVisible.value = false
//     }
//   } else {
//     tooltipVisible.value = false
//   }
// })

onMounted(async () => {
  await mapStore.readyForMap()
  mapStore.getMainMapContext().on('feature-hover', (event: any,hitItems:any[]) => {
    // 处理鼠标悬停事件
    console.log(event,hitItems)
    tooltipVisible.value =hitItems.length>0
    if(!tooltipVisible.value) return
    tooltipContent.value = hitItems?.[0].attributes?.name || '未命名'
    tooltipPosition.value = { x: event.x, y: event.y }
  })
})
</script>

<style scoped>
.feature-tooltip {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
  transform: translate(10px, -50%);
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
