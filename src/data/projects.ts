export interface Project {
  title: string;
  description: string;
  status: string;
  year: string;
  stack: string[];
  category: string;
  outcome: string;
  href?: string;
}

export const projects: Project[] = [
  {
    title: '城市热岛效应空间分析',
    description: '融合 Landsat 地表温度、土地覆盖与人口数据，分析城市热岛的空间分异。',
    status: '研究复盘',
    year: '2026',
    stack: ['Google Earth Engine', 'QGIS', 'Python'],
    category: '遥感 × 城市地理',
    outcome: '完成温度反演、分区统计与可复现地图表达流程。'
  },
  {
    title: '基于 Python 的地理数据处理工具',
    description: '把坐标转换、格式检查、字段清洗等重复操作封装成轻量命令行工具。',
    status: '持续迭代',
    year: '2026',
    stack: ['Python', 'GeoPandas', 'Rasterio'],
    category: '空间数据工程',
    outcome: '建立批处理、日志记录与异常数据报告机制。'
  },
  {
    title: '交通网络最短路径可视化',
    description: '从道路网络建模出发，对比 Dijkstra 与 A* 算法，并交互展示路径结果。',
    status: '课程项目',
    year: '2025',
    stack: ['NetworkX', 'OSMnx', 'Matplotlib'],
    category: '算法 × 地理网络',
    outcome: '实现路网清洗、权重设计、路径计算与结果可视化。'
  }
];
