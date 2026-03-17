import { ref, shallowRef } from 'vue'
import Graphic from '@arcgis/core/Graphic'
import MapContext, { isMultiSelect } from '@/components/map-context/index'
import { findMinGraphic } from '@/components/map-context/utils/geo-utils'
import { LayerType } from '@/components/map-context/types.d'
const selectable_layer_types = [LayerType.Mass,LayerType.Assets]
export default function useFeatureInterop() {
  const selectedFeatures = shallowRef<Graphic[]>([])
  const hoverGraphic = shallowRef<Graphic>()
  let mapContext: MapContext | null = null
  const featureIsSelected = (feature: Graphic):boolean => selectedFeatures.value.some((item) => item === feature)
  
  const setMapContext=(context:MapContext)=>{
    mapContext = context
    mapContext.on('selected-changed', (event: any) => {
      selectedFeatures.value = event?.features??[]
    })
    mapContext.on('feature-hover', (event: any, items: Graphic[]) => {
      if (hoverGraphic.value) {
        mapContext!.resetSymbolFromHover(hoverGraphic.value)
      }
      if (items.length === 0){
        hoverGraphic.value = undefined
        return
      }
      hoverGraphic.value = findMinGraphic(items)
      if (hoverGraphic.value) {
        !featureIsSelected(hoverGraphic.value) && mapContext!.setSymbolToHover(hoverGraphic.value)
      }
    })
    mapContext.on('feature-hit', (event: any, items: Graphic[]) => {
      if (event.button === 2) {
        // right click
        return
      }
      const selectedItems = items.filter((item) =>
        selectable_layer_types.includes(item.attributes?.type),
      )
      if (selectedItems.length === 0 && !isMultiSelect(event.native)) {
        mapContext?.unSelectAll()
      }
      const selectedItem = findMinGraphic(items)
      if (selectedItem) {
          mapContext?.select(selectedItem, isMultiSelect(event.native))
      }
    })
  }

  return {
    selectedFeatures,
    hoverGraphic,
    setMapContext
  }
}
