import { categories } from '../data/categories';
import { formatDate, getPostUrl, getReadingTime, type Post } from './posts';
import { withBase } from './site';

export interface HomeArticle {
  id: string;
  title: string;
  description: string;
  href: string;
  date: string;
  datetime: string;
  category: string;
  readingTime: number;
  featured: boolean;
}

export interface HomeField {
  id: string;
  name: string;
  code: string;
  number: string;
  description: string;
  count: number;
  href: string;
  articles: HomeArticle[];
}

export function getHomeFields(posts: Post[]): HomeField[] {
  const codes = ['GEOGRAPHY', 'COMPUTING', 'GEOCOMPUTING', 'EVERYDAY'];
  const makeField = (
    field: Omit<HomeField, 'count' | 'articles'>,
    candidates: Post[]
  ): HomeField => {
    const lead = candidates.find((post) => post.data.featured) ?? candidates[0];
    const ordered = lead ? [lead, ...candidates.filter((post) => post.id !== lead.id)] : [];
    return {
      ...field,
      count: candidates.length,
      articles: ordered.slice(0, 6).map((post) => ({
        id: post.id,
        title: post.data.title,
        description: post.data.description,
        href: withBase(getPostUrl(post)),
        date: formatDate(post.data.pubDate),
        datetime: post.data.pubDate.toISOString().slice(0, 10),
        category: categories.find((category) => category.id === post.data.category)?.name ?? '',
        readingTime: getReadingTime(post),
        featured: post.data.featured
      }))
    };
  };
  return [
    makeField(
      {
        id: 'all',
        name: '全部记录',
        code: 'ALL NOTES',
        number: '00',
        description: '学习、研究与日常，沿着问题留下记录。',
        href: withBase('/posts/')
      },
      posts
    ),
    ...categories.map((category, index) =>
      makeField(
        {
          id: category.id,
          name: category.id === 'geocomputing' ? '地理计算' : category.name,
          code: codes[index],
          number: category.index,
          description: category.description,
          href: withBase(`/categories/${category.id}/`)
        },
        posts.filter((post) => post.data.category === category.id)
      )
    )
  ];
}
