export interface SearchEntry {
  title: string;
  description: string;
  url: string;
  text: string;
}

// Pagefind's word segmentation can miss Chinese phrases. This literal fallback
// searches only the published articles exported by search-index.json.
export function searchEntries(entries: SearchEntry[], query: string) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entries
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase();
      const description = entry.description.toLocaleLowerCase();
      const text = entry.text.toLocaleLowerCase();
      const searchable = `${title} ${description} ${text}`;
      if (!terms.every((term) => searchable.includes(term))) return undefined;
      const score = terms.reduce(
        (sum, term) => sum + (title.includes(term) ? 10 : description.includes(term) ? 4 : 1),
        0
      );
      const match = text.indexOf(terms[0]);
      const start = Math.max(0, match - 45);
      const excerpt = entry.text.slice(start, start + 180);
      return {
        ...entry,
        score,
        excerpt: `${start ? '…' : ''}${excerpt}${start + 180 < entry.text.length ? '…' : ''}`
      };
    })
    .filter((entry): entry is SearchEntry & { score: number; excerpt: string } => !!entry)
    .sort((a, b) => b.score - a.score);
}
