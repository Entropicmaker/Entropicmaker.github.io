const base = import.meta.env.BASE_URL;

export function withBase(path = '/') {
  const normalized = path.replace(/^\/+/, '');
  return `${base}${normalized}`;
}

export function absoluteUrl(path: string, site?: URL) {
  return site ? new URL(withBase(path), site).toString() : withBase(path);
}
