/**
 * Integration test: exercises the full add → list → search → delete → export → import cycle
 * using a temporary store path.
 */
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { addBookmark } from '../../src/commands/add';
import { listBookmarks } from '../../src/commands/list';
import { searchBookmarks } from '../../src/commands/search';
import { deleteBookmark } from '../../src/commands/delete';
import { exportBookmarks } from '../../src/commands/export';
import { importBookmarks } from '../../src/commands/import';
import { BookmarkStore } from '../../src/types';

function tempPath(suffix: string): string {
  return path.join(os.tmpdir(), `bmark-integration-${Date.now()}-${suffix}.json`);
}

describe('Bookmark CLI integration', () => {
  let storePath: string;

  beforeEach(async () => {
    storePath = tempPath('store');
    // start with empty store
    await fs.writeFile(storePath, JSON.stringify({ version: 1, bookmarks: [] }), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
  });

  it('full add → list → search → delete → export → import cycle', async () => {
    // Add bookmarks
    await addBookmark({ url: 'https://typescriptlang.org', title: 'TypeScript', tags: ['ts'] }, storePath);
    await addBookmark({ url: 'https://github.com', title: 'GitHub', tags: ['tools'] }, storePath);
    await addBookmark({ url: 'https://docs.rs', title: 'Rust Docs', tags: ['rust'] }, storePath);

    // List — expect 3
    const all = await listBookmarks({}, storePath);
    expect(all).toHaveLength(3);

    // Filter by tag — expect 1
    const tsOnly = await listBookmarks({ tag: 'ts' }, storePath);
    expect(tsOnly).toHaveLength(1);
    expect(tsOnly[0].title).toBe('TypeScript');

    // Search — 'typescript' matches the URL typescriptlang.org
    const searchResult = await searchBookmarks('typescript', storePath);
    expect(searchResult).toHaveLength(1);

    // Delete
    const idToDelete = all[1].id; // GitHub
    const deleteResult = await deleteBookmark(idToDelete, storePath);
    expect(deleteResult.deleted).toBe(true);

    const afterDelete = await listBookmarks({}, storePath);
    expect(afterDelete).toHaveLength(2);

    // Export
    const exportPath = tempPath('export');
    const exportResult = await exportBookmarks(exportPath, storePath);
    expect(exportResult.count).toBe(2);

    // Import back (should merge; all duplicates since same URLs)
    const importResult = await importBookmarks(exportPath, storePath);
    expect(importResult.imported).toBe(0);
    expect(importResult.skipped).toBe(2);

    // Import fresh bookmarks
    const freshPath = tempPath('fresh');
    const fresh = [{ id: 'zzz99999', url: 'https://nodejs.org', title: 'Node.js', tags: [], createdAt: new Date().toISOString() }];
    await fs.writeFile(freshPath, JSON.stringify(fresh), 'utf8');
    const importFreshResult = await importBookmarks(freshPath, storePath);
    expect(importFreshResult.imported).toBe(1);

    const finalList = await listBookmarks({}, storePath);
    expect(finalList).toHaveLength(3);

    // Cleanup
    await fs.unlink(exportPath).catch(() => undefined);
    await fs.unlink(freshPath).catch(() => undefined);
  });
});
