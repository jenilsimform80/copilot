import * as fs from 'fs/promises';
import * as path from 'path';
import { readStore } from '../storage';
import { Bookmark } from '../types';

export interface ExportResult {
  count: number;
  outPath: string;
}

/**
 * Exports all bookmarks to a JSON file at the given output path.
 */
export async function exportBookmarks(outPath: string, storePath?: string): Promise<ExportResult> {
  const store = await readStore(storePath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(store.bookmarks, null, 2), 'utf8');
  return { count: store.bookmarks.length, outPath };
}
