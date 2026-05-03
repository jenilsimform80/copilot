import { randomBytes } from 'crypto';
import { readStore, writeStore } from '../storage';
import { isValidUrl, normalizeTags, titleFromUrl } from '../validate';

export interface AddOptions {
  url: string;
  title?: string;
  tags?: string[];
}

export interface AddResult {
  added: boolean;
  duplicate?: boolean;
  id?: string;
  title?: string;
}

/**
 * Adds a new bookmark to the store.
 * Returns { added: false, duplicate: true } if the URL already exists.
 * Throws if the URL is invalid.
 */
export async function addBookmark(options: AddOptions, storePath?: string): Promise<AddResult> {
  const { url, title, tags = [] } = options;

  if (!isValidUrl(url)) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const store = await readStore(storePath);
  const existing = store.bookmarks.find((b) => b.url === url);
  if (existing) {
    return { added: false, duplicate: true };
  }

  const id = randomBytes(4).toString('hex'); // 8 hex chars
  const resolvedTitle = title?.trim() || titleFromUrl(url);
  const normalizedTags = normalizeTags(tags.join(','));

  store.bookmarks.push({
    id,
    url,
    title: resolvedTitle,
    tags: normalizedTags,
    createdAt: new Date().toISOString(),
  });

  await writeStore(store, storePath);
  return { added: true, id, title: resolvedTitle };
}
