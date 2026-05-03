import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { exportBookmarks } from '../../../src/commands/export';
import { BookmarkStore } from '../../../src/types';

function tempPath(suffix: string): string {
  return path.join(os.tmpdir(), `bmark-export-test-${Date.now()}-${suffix}.json`);
}

const sampleStore: BookmarkStore = {
  version: 1,
  bookmarks: [
    { id: 'aaa00001', url: 'https://example.com', title: 'Example', tags: ['dev'], createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'bbb00002', url: 'https://github.com', title: 'GitHub', tags: [], createdAt: '2026-01-02T00:00:00.000Z' },
  ],
};

describe('exportBookmarks', () => {
  let storePath: string;

  beforeEach(async () => {
    storePath = tempPath('store');
    await fs.writeFile(storePath, JSON.stringify(sampleStore), 'utf8');
  });

  afterEach(async () => {
    await fs.unlink(storePath).catch(() => undefined);
  });

  it('writes bookmarks to the output file', async () => {
    const outPath = tempPath('out');
    const result = await exportBookmarks(outPath, storePath);
    expect(result.count).toBe(2);
    const written = JSON.parse(await fs.readFile(outPath, 'utf8'));
    expect(Array.isArray(written)).toBe(true);
    expect(written).toHaveLength(2);
    await fs.unlink(outPath);
  });
});
