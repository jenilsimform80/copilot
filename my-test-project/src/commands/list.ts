import { readStore } from '../storage';
import { Bookmark } from '../types';

export interface ListOptions {
  tag?: string;
}

/**
 * Returns all bookmarks, optionally filtered by a single tag.
 */
export async function listBookmarks(options: ListOptions, storePath?: string): Promise<Bookmark[]> {
  const store = await readStore(storePath);
  const { tag } = options;

  if (tag) {
    return store.bookmarks.filter((b) => b.tags.includes(tag.toLowerCase()));
  }

  return store.bookmarks;
}
