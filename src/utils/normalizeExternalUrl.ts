/**
 * Гарантирует абсолютный URL для внешних ссылок.
 * Без схемы браузер трактует строку как путь на текущем сайте (страница «не открывается»).
 */
export function normalizeExternalUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  return `https://${s}`;
}
