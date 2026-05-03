import { readStore } from '../storage';
import { Bookmark } from '../types';

/**
 * Searches bookmarks by a case-insensitive keyword against title and URL.
 */
export async function searchBookmarks(query: string, storePath?: string): Promise<Bookmark[]> {
  const store = await readStore(storePath);
  const lower = query.toLowerCase();
  return store.bookmarks.filter(
    (b) => b.title.toLowerCase().includes(lower) || b.url.toLowerCase().includes(lower),
  );
}
