export const SEARCH_PAGE_SIZE = 20;

export function paginateResults<T>(items: T[], requestedPage = 1) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));
  const page = Math.max(
    1,
    Math.min(totalPages, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1)
  );
  const start = (page - 1) * SEARCH_PAGE_SIZE;
  return { items: items.slice(start, start + SEARCH_PAGE_SIZE), total, totalPages, page };
}
