import type { CollectionEntry } from 'astro:content';
import { categoryMap, type CategoryId } from '../data/categories';

export type Post = CollectionEntry<'posts'>;

export function getPublishedPosts(posts: Post[]) {
  return posts
    .filter((post) => (import.meta.env.PROD ? !post.data.draft : true))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getPostSlug(post: Post) {
  return post.id.replace(/\.(md|mdx)$/i, '');
}

export function getPostUrl(post: Post) {
  return `/posts/${getPostSlug(post)}/`;
}

export function getCategory(category: string) {
  return categoryMap[category as CategoryId];
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function getReadingTime(post: Post) {
  if (post.data.readingTime) return post.data.readingTime;
  const body = post.body ?? '';
  const chinese = (body.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (body.replace(/[\u3400-\u9fff]/g, ' ').match(/\b[\w-]+\b/g) || []).length;
  return Math.max(1, Math.ceil(chinese / 350 + latin / 220));
}

export function tagToSlug(tag: string) {
  return tag
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}-]/gu, '');
}

export function getAllTags(posts: Post[]) {
  const counts = new Map<string, number>();
  posts.forEach((post) =>
    post.data.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))
  );
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, slug: tagToSlug(name) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function groupPostsByYear(posts: Post[]) {
  const groups = new Map<number, Post[]>();
  posts.forEach((post) => {
    const year = post.data.pubDate.getFullYear();
    groups.set(year, [...(groups.get(year) || []), post]);
  });
  return [...groups.entries()].sort(([a], [b]) => b - a);
}

export function getRelatedPosts(current: Post, posts: Post[], limit = 3) {
  return posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) => current.data.tags.includes(tag)).length;
      const sameCategory = post.data.category === current.data.category ? 2 : 0;
      return { post, score: sharedTags + sameCategory };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf()
    )
    .slice(0, limit)
    .map((item) => item.post);
}
