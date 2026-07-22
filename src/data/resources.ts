export type ResourceFile = {
  title: string;
  description: string;
  href: string;
  format: 'PDF' | 'DOC' | 'DOCX';
  size: string;
  updatedAt: string;
};

export type ResourceGroup = {
  id: string;
  title: string;
  description: string;
  files: ResourceFile[];
};

export const resourceGroups: ResourceGroup[] = [
  {
    id: 'gis',
    title: '地理信息系统（GIS）',
    description: '围绕期末复习梳理的提纲、题库与背诵材料。',
    files: [
      {
        title: 'GIS 全题库复习手册',
        description: '按题目整理的 GIS 期末复习手册。',
        href: '/downloads/2025-2026-freshman-spring/gis/GIS全题库复习手册.docx',
        format: 'DOCX',
        size: '44 KB',
        updatedAt: '2026 年 7 月'
      },
      {
        title: 'GIS 重点提纲',
        description: '用于快速回顾核心知识点的复习提纲。',
        href: '/downloads/2025-2026-freshman-spring/gis/GIS重点提纲.docx',
        format: 'DOCX',
        size: '62 KB',
        updatedAt: '2026 年 7 月'
      },
      {
        title: 'GIS 期末考试最终版复习提纲',
        description: '整合后的期末复习提纲版本。',
        href: '/downloads/2025-2026-freshman-spring/gis/GIS期末考试_最终版复习提纲.docx',
        format: 'DOCX',
        size: '34 KB',
        updatedAt: '2026 年 7 月'
      },
      {
        title: 'GIS 填空、名词、简答与论述背诵提纲',
        description: '按题型组织的背诵与自测提纲。',
        href: '/downloads/2025-2026-freshman-spring/gis/GIS期末考试_填空名词简答论述背诵提纲.docx',
        format: 'DOCX',
        size: '29 KB',
        updatedAt: '2026 年 7 月'
      }
    ]
  },
  {
    id: 'remote-sensing',
    title: '遥感概论',
    description: '遥感概论课程的考点与术语复习材料。',
    files: [
      {
        title: '遥感概论期末复习考点',
        description: '适合直接阅读、标注与打印的 PDF 版复习考点。',
        href: '/downloads/2025-2026-freshman-spring/remote-sensing/遥感概论期末复习考点.pdf',
        format: 'PDF',
        size: '418 KB',
        updatedAt: '2026 年 7 月'
      },
      {
        title: '遥感名词解释',
        description: '遥感课程常见名词解释整理。',
        href: '/downloads/2025-2026-freshman-spring/remote-sensing/遥感名词解释.docx',
        format: 'DOCX',
        size: '18 KB',
        updatedAt: '2026 年 7 月'
      }
    ]
  },
  {
    id: 'geomorphology',
    title: '地貌学',
    description: '地貌学期末题目与作答思路整理。',
    files: [
      {
        title: '地貌学期末考试题样答',
        description: '用于复习与自检的题目样答材料。',
        href: '/downloads/2025-2026-freshman-spring/geomorphology/地貌学期末考试题样答.doc',
        format: 'DOC',
        size: '948 KB',
        updatedAt: '2026 年 7 月'
      }
    ]
  }
];
