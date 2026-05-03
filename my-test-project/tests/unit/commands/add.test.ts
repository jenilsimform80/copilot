import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import { addBookmark } from '../../../src/commands/add';
import { BookmarkStore } from '../../../src/types';

function tempPath(): string {
  return path.join(os.tmpdir(), `bmark-add-test-${Date.now()}.json`);
}

async function emptyStore(p: string): Promise<void> {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify({ version: 1, bookmarks: [] }), 'utf8');
}

describe('addBookmark', () => {
  it('adds a bookmark with all fields', async () => {
    const p = tempPath();
    await emptyStore(p);
    const result = await addBookmark({ url: 'https://example.com', title: 'Example', tags: ['dev'] }, p);
    expect(result.added).toBe(true);
    const raw = JSON.parse(await fs.readFile(p, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks).toHaveLength(1);
    expect(raw.bookmarks[0].url).toBe('https://example.com');
    expect(raw.bookmarks[0].title).toBe('Example');
    expect(raw.bookmarks[0].tags).toEqual(['dev']);
    expect(raw.bookmarks[0].id).toHaveLength(8);
    await fs.unlink(p);
  });

  it('uses hostname as title when title is omitted', async () => {
    const p = tempPath();
    await emptyStore(p);
    const result = await addBookmark({ url: 'https://github.com' }, p);
    expect(result.added).toBe(true);
    const raw = JSON.parse(await fs.readFile(p, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks[0].title).toBe('github.com');
    await fs.unlink(p);
  });

  it('rejects duplicate URLs', async () => {
    const p = tempPath();
    await emptyStore(p);
    await addBookmark({ url: 'https://example.com', title: 'First' }, p);
    const result = await addBookmark({ url: 'https://example.com', title: 'Second' }, p);
    expect(result.added).toBe(false);
    expect(result.duplicate).toBe(true);
    const raw = JSON.parse(await fs.readFile(p, 'utf8')) as BookmarkStore;
    expect(raw.bookmarks).toHaveLength(1);
    await fs.unlink(p);
  });

  it('rejects invalid URLs', async () => {
    const p = tempPath();
    await emptyStore(p);
    await expect(addBookmark({ url: 'not-a-url' }, p)).rejects.toThrow(/invalid url/i);
    await fs.unlink(p);
  });
});
