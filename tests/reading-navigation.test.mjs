import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getReturnDestination } from '../src/utils/navigation.ts';
import remarkArticleHeadings from '../src/utils/remark-article-headings.mjs';

const article = (from, prefix = '') =>
  `https://lingeocs.com${prefix}/posts/example/?from=${encodeURIComponent(from)}`;
test('return to the exact directory row, archive, tag or search query', () => {
  for (const from of [
    '/#post-example',
    '/posts/#post-example',
    '/archive/#post-example',
    '/tags/遥感/#post-example',
    '/search/?q=Vcmax'
  ]) {
    const result = getReturnDestination(article(from));
    assert.equal(decodeURI(result.href), from);
  }
});
test('respect a deployment base path', () => {
  assert.equal(
    getReturnDestination(article('/blog/posts/#post-a', '/blog'), '/blog/').href,
    '/blog/posts/#post-a'
  );
  assert.equal(getReturnDestination(article('/posts/', '/blog'), '/blog/'), undefined);
});
test('direct visits retain the server-rendered directory fallback', () => {
  assert.equal(getReturnDestination('https://lingeocs.com/posts/example/'), undefined);
});
test('reject external origins, scripts, article loops and unrelated routes', () => {
  for (const from of [
    'https://example.com/',
    '//example.com/posts/',
    'javascript:alert(1)',
    '/posts/other/',
    '/unknown/',
    '/posts/../projects/'
  ]) {
    assert.equal(getReturnDestination(article(from)), undefined);
  }
});
const heading = (depth, value) => ({ type: 'heading', depth, children: [{ type: 'text', value }] });
test('remove only a duplicate article title, preserve the text and demote the outline', () => {
  const tree = {
    type: 'root',
    children: [
      heading(1, '文章标题'),
      heading(1, '第一层'),
      heading(2, '术语'),
      { type: 'code', value: '# keep code' }
    ]
  };
  remarkArticleHeadings()(tree, { data: { astro: { frontmatter: { title: '文章标题' } } } });
  assert.deepEqual(
    tree.children.map((node) => node.depth),
    [2, 3, undefined]
  );
  assert.equal(tree.children[0].children[0].value, '第一层');
  assert.equal(tree.children[2].value, '# keep code');
});
test('ordinary h2 articles keep their existing outline', () => {
  const tree = { type: 'root', children: [heading(2, '介绍'), heading(3, '方法')] };
  remarkArticleHeadings()(tree, { data: {} });
  assert.deepEqual(
    tree.children.map((node) => node.depth),
    [2, 3]
  );
});
test('a different h1 is content, not a duplicate title', () => {
  const tree = { type: 'root', children: [heading(1, '内容')] };
  remarkArticleHeadings()(tree, { data: { astro: { frontmatter: { title: '标题' } } } });
  assert.equal(tree.children.length, 1);
  assert.equal(tree.children[0].depth, 2);
});

test('Chinese search finds literal phrases and ranks title matches first', async () => {
  const { searchEntries } = await import('../src/utils/search.ts');
  const entries = [
    { title: '方法', description: '', text: '研究遥感光合作用', url: '/a/' },
    { title: '遥感课件', description: '', text: '光合作用 Vcmax', url: '/b/' }
  ];
  assert.deepEqual(
    searchEntries(entries, '遥感').map((entry) => entry.url),
    ['/b/', '/a/']
  );
  assert.deepEqual(
    searchEntries(entries, '遥感 VCMAX').map((entry) => entry.url),
    ['/b/']
  );
  assert.equal(searchEntries(entries, '无此词').length, 0);
  assert.equal(searchEntries(entries, '  ').length, 0);
});

test('introductory h2 stays h2 before later top-level parts', () => {
  const tree = {
    type: 'root',
    children: [heading(1, '标题'), heading(2, '概览'), heading(1, '第一层'), heading(2, '术语')]
  };
  remarkArticleHeadings()(tree, { data: { astro: { frontmatter: { title: '标题' } } } });
  assert.deepEqual(
    tree.children.map((node) => node.depth),
    [2, 2, 3]
  );
});
