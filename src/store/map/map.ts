import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import Graphic from '@arcgis/core/Graphic'
import Extent from '@arcgis/core/geometry/Extent.js'
import MapContext from '@/components/map-context/index'
import useFeatureInterop from './feature-interop'
import {defer} from '@/components/map-context/utils'



export const useMapStore = defineStore('map', () => {
  let mapContext: MapContext | null = null
  let splitMapContexts: MapContext[] | null = null
  const featureInterop = useFeatureInterop()
  let mapVisibleExtent: Extent | null = null


  const setMapContext = (context: MapContext) => {
    mapContext = context
    splitMapContexts=null
    mapReadyDefer?.resolve()
    mapPreparing.value = false
    featureInterop.setMapContext(mapContext)
    if (mapVisibleExtent) {
      mapContext.mapView.extent = mapVisibleExtent
    }
  }

  let mapReadyDefer:any = defer()
  const mapPreparing = ref(true)
  const resetMapReadyDefer = () => {
    splitMapContexts=null
    mapPreparing.value = true
    mapReadyDefer = defer()
  }



  return {
    setMapContext,
    getSelectedFeatures: computed(() => featureInterop.selectedFeatures),
    getGraphicHover: computed(() => featureInterop.hoverGraphic),
    //主地图获取
    getMainMapContext: () => mapContext || splitMapContexts?.[0],
    setMapVisibleExtent: (val: Extent | null) => (mapVisibleExtent = val),
    resetMapReadyDefer,
    readyForMap:()=>mapReadyDefer?.promise,
    mapPreparing
  }
})
