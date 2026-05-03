import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { readStore, writeStore, defaultStorePath } from '../../src/storage';
import { BookmarkStore } from '../../src/types';

describe('defaultStorePath', () => {
  it('returns a path ending with bookmarks.json', () => {
    expect(defaultStorePath()).toMatch(/bookmarks\.json$/);
  });
});

describe('readStore', () => {
  it('returns empty store when file does not exist', async () => {
    const tmpPath = path.join(os.tmpdir(), `bmark-test-${Date.now()}.json`);
    const store = await readStore(tmpPath);
    expect(store.version).toBe(1);
    expect(store.bookmarks).toEqual([]);
  });

  it('reads an existing store file', async () => {
    const tmpPath = path.join(os.tmpdir(), `bmark-test-${Date.now()}.json`);
    const data: BookmarkStore = {
      version: 1,
      bookmarks: [
        { id: 'abc', url: 'https://example.com', title: 'Example', tags: [], createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    await fs.writeFile(tmpPath, JSON.stringify(data), 'utf8');
    const store = await readStore(tmpPath);
    expect(store.bookmarks).toHaveLength(1);
    expect(store.bookmarks[0].url).toBe('https://example.com');
    await fs.unlink(tmpPath);
  });

  it('throws on corrupted JSON', async () => {
    const tmpPath = path.join(os.tmpdir(), `bmark-test-${Date.now()}.json`);
    await fs.writeFile(tmpPath, 'NOT JSON', 'utf8');
    await expect(readStore(tmpPath)).rejects.toThrow(/corrupted/i);
    await fs.unlink(tmpPath);
  });
});

describe('writeStore', () => {
  it('writes store to disk and can be read back', async () => {
    const tmpPath = path.join(os.tmpdir(), `bmark-test-${Date.now()}.json`);
    const store: BookmarkStore = {
      version: 1,
      bookmarks: [
        { id: 'abc', url: 'https://example.com', title: 'Example', tags: ['dev'], createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    await writeStore(store, tmpPath);
    const contents = await fs.readFile(tmpPath, 'utf8');
    const parsed = JSON.parse(contents) as BookmarkStore;
    expect(parsed.bookmarks[0].id).toBe('abc');
    await fs.unlink(tmpPath);
  });

  it('creates parent directories if they do not exist', async () => {
    const tmpDir = path.join(os.tmpdir(), `bmark-test-dir-${Date.now()}`);
    const tmpPath = path.join(tmpDir, 'bookmarks.json');
    const store: BookmarkStore = { version: 1, bookmarks: [] };
    await writeStore(store, tmpPath);
    const exists = await fs.stat(tmpPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    await fs.rm(tmpDir, { recursive: true });
  });
});
