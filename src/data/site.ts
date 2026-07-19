export const siteConfig = {
  name: '选择性失忆',
  shortName: '选择性失忆',
  title: '选择性失忆',
  description: '自然地理专业学生，关注遥感、GIS、空间数据工程和GeoAI',
  author: '自然地理专业学生',
  email: 'LinCooper42@outlook.com',
  github: 'https://github.com/Entropicmaker',
  intro: '自然地理专业学生，关注遥感、GIS、空间数据工程和GeoAI',
  about: '自然地理专业学生，关注遥感、GIS、空间数据工程和GeoAI'
} as const;

export const navigation = [
  { label: '文章', href: '/posts/' },
  { label: '分类', href: '/categories/' },
  { label: '标签', href: '/tags/' },
  { label: '归档', href: '/archive/' },
  { label: '项目', href: '/projects/' },
  { label: '关于', href: '/about/' }
] as const;
