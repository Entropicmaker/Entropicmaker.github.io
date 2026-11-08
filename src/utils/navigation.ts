// Only accept an existing same-origin index as an article's return destination.
export function getReturnDestination(currentUrl: string, base = '/') {
  try {
    const current = new URL(currentUrl);
    const from = current.searchParams.get('from');
    if (!from) return undefined;
    const target = new URL(from, current.origin);
    if (target.origin !== current.origin || !target.pathname.startsWith(base)) return undefined;
    const route = '/' + target.pathname.slice(base.length);
    const labels: Record<string, string> = {
      '/': '返回首页目录',
      '/posts/': '返回文章目录',
      '/archive/': '返回归档',
      '/search/': '返回搜索结果',
      '/tags/': '返回标签'
    };
    const label = labels[route] ?? (/^\/tags\/[^/]+\/$/.test(route) ? '返回标签文章' : undefined);
    if (!label) return undefined;
    return { href: target.pathname + target.search + target.hash, label };
  } catch {
    return undefined;
  }
}
