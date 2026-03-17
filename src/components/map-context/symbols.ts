import { vector } from 'echarts'
import { LayerType } from './types.d'
//行政边界样式
export const boundary = {
  type: 'simple-line',
  color: [55, 98, 255, 0.8],
  width: 3,
  style: 'dash',
}
//地块样式
const mass = {
  //常规样式（影像地图
  image: {
    normal: {
      type: 'simple-fill',
      color: [255, 255, 255, 0],
      outline: {
        color: [136, 255, 114, 1],
        width: 1.5,
      },
    },
  },

  //常规样式（矢量地图）
  vector: {
    normal: {
      type: 'simple-fill',
      color: [255, 255, 255, 0],
      outline: {
        color: [136, 255, 114, 1],
        width: 1.5,
      },
    },
  },

  //hover样式
  hover: {
    type: 'simple-fill',
    color: [255, 255, 255, 0],
    outline: {
      color: [255, 188, 0, 1],
      width: 1,
    },
  },
  select: {
    type: 'simple-fill',
    color: [230, 4, 4, 0],
    outline: {
      color: [230, 4, 4, 1],
      width: 1,
    },
  },
  selectFill: {
    type: 'simple-fill',
    color: [230, 4, 4, 0],
    outline: {
      color: [230, 4, 4, 1],
      width: 1,
    },
  },
}

const assets = {
  //常规样式（影像地图
  image: {
    normal: {
      type: 'simple-fill',
      color: [136, 255, 114, 0],
      outline: {
        color: [136, 255, 114, 0.8],
        width: 1,
      },
    },
  },

  //常规样式（矢量地图）
  vector: {
    normal: {
      type: 'simple-fill',
      color: [136, 255, 114, 0],
      outline: {
        color: [136, 255, 114, 0.8],
        width: 1,
      },
    },
  },

  //hover样式
  hover: {
    type: 'simple-fill',
    color: [136, 255, 114, 0],
    outline: {
      color: [136, 255, 114, 0.8],
      width: 2,
    },
  },
  select: {
    type: 'simple-fill',
    color: [136, 255, 114, 0],
    outline: {
      color: [136, 255, 114, 0.8],
      width: 2,
    },
  },
}

const airline_point = {
  type: 'simple-marker',
  color: [255, 9, 18, 1],
  size: 10,
  outline: {
    color: [255, 255, 255, 1],
    width: 2,
  },
}


const airline = {
  type: 'simple-line',
  color: [255, 166, 0, 1],
  width: 1,
}


interface Symbols {
  [key: string]: any
}
const symbols: Symbols = {
  [LayerType.Mass]: mass,
  [LayerType.Boundary]: boundary,
  [LayerType.Assets]: assets,
}

export const subTypesSymbols: Symbols = {
  airline_point,
  airline,
}

export default symbols
