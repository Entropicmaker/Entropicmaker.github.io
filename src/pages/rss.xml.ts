import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/site';
import { getPostUrl, getPublishedPosts } from '../utils/posts';
import { withBase } from '../utils/site';

export async function GET(context: { site?: URL }) {
  const posts = getPublishedPosts(await getCollection('posts'));
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: context.site ?? new URL('https://example.github.io'),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(getPostUrl(post))
    })),
    customData: '<language>zh-CN</language>'
  });
}
