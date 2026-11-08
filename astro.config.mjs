import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkArticleHeadings from './src/utils/remark-article-headings.mjs';

const site = process.env.PUBLIC_SITE_URL || 'https://example.github.io';
const rawBase = process.env.PUBLIC_BASE_PATH || '/';
const base = `/${rawBase.replace(/^\/+|\/+$/g, '')}${rawBase === '/' ? '' : '/'}`;

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkMath, remarkArticleHeadings],
    rehypePlugins: [rehypeKatex],
    remarkRehype: { allowDangerousHtml: false },
    shikiConfig: { theme: 'github-dark-default', wrap: true }
  }
});
