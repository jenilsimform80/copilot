import { Bookmark } from './types';

const COL_WIDTHS = { id: 10, title: 30, url: 45, tags: 20 };

/**
 * Renders bookmarks as a human-readable plain-text table.
 */
export function formatTable(bookmarks: Bookmark[]): string {
  if (bookmarks.length === 0) return 'No bookmarks found.';

  const pad = (s: string, n: number): string => s.slice(0, n).padEnd(n);

  const header = [
    pad('ID', COL_WIDTHS.id),
    pad('Title', COL_WIDTHS.title),
    pad('URL', COL_WIDTHS.url),
    pad('Tags', COL_WIDTHS.tags),
  ].join('  ');

  const divider = '-'.repeat(header.length);

  const rows = bookmarks.map((b) =>
    [
      pad(b.id, COL_WIDTHS.id),
      pad(b.title, COL_WIDTHS.title),
      pad(b.url, COL_WIDTHS.url),
      pad(b.tags.join(', '), COL_WIDTHS.tags),
    ].join('  '),
  );

  return [header, divider, ...rows].join('\n');
}

/**
 * Serializes bookmarks to a pretty-printed JSON string.
 */
export function formatJson(bookmarks: Bookmark[]): string {
  return JSON.stringify(bookmarks, null, 2);
}
