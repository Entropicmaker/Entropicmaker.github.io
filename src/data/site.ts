export const siteConfig = {
  name: '选择性失忆',
  shortName: '选择性失忆',
  title: '选择性失忆',
  description: '地理专业学生，关注遥感、GIS、空间数据工程和GeoAI',
  author: '选择性失忆',
  email: '163517493+Entropicmaker@users.noreply.github.com',
  github: 'https://github.com/Entropicmaker',
  intro: '地理专业学生，关注遥感、GIS、空间数据工程和GeoAI',
  about: '地理专业学生，关注遥感、GIS、空间数据工程和GeoAI'
} as const;

export const navigation = [
  { label: '文章', href: '/posts/' },
  { label: '分类', href: '/categories/' },
  { label: '标签', href: '/tags/' },
  { label: '归档', href: '/archive/' },
  { label: '资料', href: '/resources/' },
  { label: '项目', href: '/projects/' },
  { label: '关于', href: '/about/' }
] as const;
