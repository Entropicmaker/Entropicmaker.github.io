export type CategoryId = 'geography' | 'computer-science' | 'geocomputing';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  index: string;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: 'geography',
    name: '地理科学',
    shortName: '地理',
    index: '01',
    description: '从自然过程到空间分析，理解地表系统与地理数据。',
    subcategories: [
      '自然地理',
      'GIS 与空间分析',
      '遥感与制图',
      '地理数据与研究方法',
      '课程与读书笔记'
    ]
  },
  {
    id: 'computer-science',
    name: '计算机科学',
    shortName: '计算',
    index: '02',
    description: '用编程、算法与工程工具构建可靠的数据工作流。',
    subcategories: [
      '编程基础与工具',
      '算法与数据结构',
      '数据分析与可视化',
      'Web 开发',
      '开发笔记与踩坑'
    ]
  },
  {
    id: 'geocomputing',
    name: '交叉研究 / 地理计算',
    shortName: '交叉',
    index: '03',
    description: '让空间问题与计算方法相遇，探索 GeoAI 与空间数据工程。',
    subcategories: ['地理计算', 'GeoAI / 机器学习', '空间数据工程', '项目复盘']
  }
];

export const categoryMap = Object.fromEntries(categories.map((item) => [item.id, item])) as Record<
  CategoryId,
  Category
>;
