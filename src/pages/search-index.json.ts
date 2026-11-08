import { getCollection } from 'astro:content';
import { getPostUrl, getPublishedPosts } from '../utils/posts';
import { withBase } from '../utils/site';

export async function GET() {
  const entries = getPublishedPosts(await getCollection('posts')).map((post) => ({
    title: post.data.title,
    description: post.data.description,
    url: withBase(getPostUrl(post)),
    text: (post.body ?? '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^import\s.*$/gm, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#*_`>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }));
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
