import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { deleteBookmark } from '../../../src/commands/delete';
import { BookmarkStore } from '../../../src/types';

function tempPath(): string {
  return path.join(os.tmpdir(), `bmark-delete-test-${Date.now()}.json`);
}

const sampleStore: BookmarkStore = {
  version: 1,
  bookmarks: [
    { id: 'aaa00001', url: 'https://example.com', title: 'Example', tags: ['dev'], createdAt: '2026-01-01T00:00:00.000Z' },
  ],
};

describe('deleteBookmark', () => {
  let storePath: string;

  beforeEach(async () => {
    storePath = tempPath();
    await fs.writeFile(storePath, JSON.stringify(sampleStore), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
  });

  it('deletes an existing bookmark by ID', async () => {
    const result = await deleteBookmark('aaa00001', storePath);
    expect(result.deleted).toBe(true);
    const raw = JSON.parse(await fs.readFile(storePath, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks).toHaveLength(0);
  });

  it('returns notFound for a missing ID', async () => {
    const result = await deleteBookmark('zzz99999', storePath);
    expect(result.deleted).toBe(false);
    expect(result.notFound).toBe(true);
  });
});
