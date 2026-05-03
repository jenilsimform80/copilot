import { readStore, writeStore } from '../storage';

export interface DeleteResult {
  deleted: boolean;
  notFound?: boolean;
}

/**
 * Removes a bookmark by its ID.
 * Returns { deleted: false, notFound: true } if no bookmark has the given ID.
 */
export async function deleteBookmark(id: string, storePath?: string): Promise<DeleteResult> {
  const store = await readStore(storePath);
  const index = store.bookmarks.findIndex((b) => b.id === id);

  if (index === -1) {
    return { deleted: false, notFound: true };
  }

  store.bookmarks.splice(index, 1);
  await writeStore(store, storePath);
  return { deleted: true };
}
