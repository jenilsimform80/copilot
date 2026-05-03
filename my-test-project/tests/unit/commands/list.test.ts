import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { listBookmarks } from '../../../src/commands/list';
import { BookmarkStore } from '../../../src/types';

function tempPath(): string {
  return path.join(os.tmpdir(), `bmark-list-test-${Date.now()}.json`);
}

const sampleStore: BookmarkStore = {
  version: 1,
  bookmarks: [
    { id: 'aaa00001', url: 'https://example.com', title: 'Example', tags: ['dev'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'bbb00002', url: 'https://github.com', title: 'GitHub', tags: ['dev', 'tools'], createdAt: '2026-01-02T00:00:00.000Z' },
    { id: 'ccc00003', url: 'https://docs.rs', title: 'Rust Docs', tags: ['rust'], createdAt: '2026-01-03T00:00:00.000Z' },
  ],
};

describe('listBookmarks', () => {
  let storePath: string;

  beforeEach(async () => {
    storePath = tempPath();
    await fs.writeFile(storePath, JSON.stringify(sampleStore), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
  });

  it('returns all bookmarks when no filter applied', async () => {
    const result = await listBookmarks({}, storePath);
    expect(result).toHaveLength(3);
  });

  it('filters by tag', async () => {
    const result = await listBookmarks({ tag: 'dev' }, storePath);
    expect(result).toHaveLength(2);
    expect(result.every((b) => b.tags.includes('dev'))).toBe(true);
  });

  it('returns empty array when tag matches nothing', async () => {
    const result = await listBookmarks({ tag: 'nonexistent' }, storePath);
    expect(result).toHaveLength(0);
  });
});
