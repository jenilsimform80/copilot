import * as fs from 'fs/promises';
import { readStore, writeStore } from '../storage';
import { Bookmark } from '../types';

export interface ImportResult {
  imported: number;
  skipped: number;
}

/**
 * Imports bookmarks from a JSON file, merging without duplicating existing URLs.
 * Throws if the import file is missing or contains invalid JSON.
 */
export async function importBookmarks(filePath: string, storePath?: string): Promise<ImportResult> {
  const raw = await fs.readFile(filePath, 'utf8');

  let incoming: Bookmark[];
  try {
    incoming = JSON.parse(raw) as Bookmark[];
  } catch {
    throw new Error(`Import file is not valid JSON: ${filePath}`);
  }

  if (!Array.isArray(incoming)) {
    throw new Error(`Import file must contain a JSON array of bookmarks.`);
  }

  const store = await readStore(storePath);
  const existingUrls = new Set(store.bookmarks.map((b) => b.url));

  let imported = 0;
  let skipped = 0;

  for (const bookmark of incoming) {
    if (existingUrls.has(bookmark.url)) {
      skipped++;
    } else {
      store.bookmarks.push(bookmark);
      existingUrls.add(bookmark.url);
      imported++;
    }
  }

  await writeStore(store, storePath);
  return { imported, skipped };
}
