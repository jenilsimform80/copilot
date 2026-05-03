import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { searchBookmarks } from '../../../src/commands/search';
import { BookmarkStore } from '../../../src/types';

function tempPath(): string {
  return path.join(os.tmpdir(), `bmark-search-test-${Date.now()}.json`);
}

const sampleStore: BookmarkStore = {
  version: 1,
  bookmarks: [
    { id: 'aaa00001', url: 'https://typescriptlang.org', title: 'TypeScript Docs', tags: ['ts', 'dev'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'bbb00002', url: 'https://github.com', title: 'GitHub', tags: ['dev', 'tools'], createdAt: '2026-01-02T00:00:00.000Z' },
    { id: 'ccc00003', url: 'https://docs.rs', title: 'Rust Docs', tags: ['rust'], createdAt: '2026-01-03T00:00:00.000Z' },
  ],
};

describe('searchBookmarks', () => {
  let storePath: string;

  beforeEach(async () => {
    storePath = tempPath();
    await fs.writeFile(storePath, JSON.stringify(sampleStore), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
  });

  it('matches by title (case-insensitive)', async () => {
    const result = await searchBookmarks('typescript', storePath);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('TypeScript Docs');
  });

  it('matches by URL substring', async () => {
    const result = await searchBookmarks('docs.rs', storePath);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ccc00003');
  });

  it('returns multiple matches', async () => {
    const result = await searchBookmarks('docs', storePath);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when nothing matches', async () => {
    const result = await searchBookmarks('xyznotfound', storePath);
    expect(result).toHaveLength(0);
  });
});
