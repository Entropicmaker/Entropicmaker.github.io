export type LingeoSiteId = 'blog' | 'codevision';

export interface LingeoSite {
  id: LingeoSiteId;
  name: string;
  descriptor: string;
  description: string;
  href: string;
  code: string;
  primary: boolean;
}

/**
 * LingeoCS 系列站点清单。
 * 新增子站时同步更新各子站自己的 ecosystem 数据，并遵循 docs/LINGEOCS_NETWORK.md。
 */
export const lingeoSites: LingeoSite[] = [
  {
    id: 'blog',
    name: '选择性失忆',
    descriptor: 'LingeoCS 主站 · 研究与知识博客',
    description: '自然地理、遥感、GIS、空间数据工程与 GeoAI 的长期笔记。',
    href: 'https://lingeocs.com/',
    code: 'HOME BASE',
    primary: true
  },
  {
    id: 'codevision',
    name: 'CodeVision Lab',
    descriptor: '交互式编程学习',
    description: '用可回放的代码步骤与可视化理解 C++、C#、Python 和算法。',
    href: 'https://lingeocs.com/codevision-lab/',
    code: 'FIELD NOTE 02',
    primary: false
  }
];

export const lingeoNetwork = {
  name: 'LingeoCS',
  label: '系列站点',
  description: '从博客主站前往编程学习工具与后续数字作品，也能随时返回主站。'
} as const;
