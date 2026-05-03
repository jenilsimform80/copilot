import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { importBookmarks } from '../../../src/commands/import';
import { Bookmark, BookmarkStore } from '../../../src/types';

function tempPath(suffix: string): string {
  return path.join(os.tmpdir(), `bmark-import-test-${Date.now()}-${suffix}.json`);
}

const existing: BookmarkStore = {
  version: 1,
  bookmarks: [
    { id: 'aaa00001', url: 'https://example.com', title: 'Example', tags: ['dev'], createdAt: '2026-01-01T00:00:00.000Z' },
  ],
};

const incoming: Bookmark[] = [
  { id: 'bbb00002', url: 'https://github.com', title: 'GitHub', tags: [], createdAt: '2026-01-02T00:00:00.000Z' },
  { id: 'aaa00001', url: 'https://example.com', title: 'Example Dup', tags: [], createdAt: '2026-01-01T00:00:00.000Z' },
];

describe('importBookmarks', () => {
  let storePath: string;
  let importFilePath: string;

  beforeEach(async () => {
    storePath = tempPath('store');
    importFilePath = tempPath('import');
    await fs.writeFile(storePath, JSON.stringify(existing), 'utf8');
    await fs.writeFile(importFilePath, JSON.stringify(incoming), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
    await fs.unlink(importFilePath).catch(() => undefined);
  });

  it('merges new bookmarks and skips duplicates by URL', async () => {
    const result = await importBookmarks(importFilePath, storePath);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    const raw = JSON.parse(await fs.readFile(storePath, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks).toHaveLength(2);
  });

  it('throws on malformed JSON without modifying store', async () => {
    await fs.writeFile(importFilePath, 'NOT JSON', 'utf8');
    await expect(importBookmarks(importFilePath, storePath)).rejects.toThrow();
    const raw = JSON.parse(await fs.readFile(storePath, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks).toHaveLength(1);
  });
});
