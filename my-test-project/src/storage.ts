import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { BookmarkStore } from './types';

const STORE_VERSION = 1;

/**
 * Returns the default path to the bookmarks JSON file.
 * Follows XDG Base Directory spec on Linux/macOS.
 */
export function defaultStorePath(): string {
  const configDir =
    process.env['XDG_CONFIG_HOME'] ??
    (process.platform === 'win32'
      ? process.env['APPDATA'] ?? path.join(os.homedir(), 'AppData', 'Roaming')
      : path.join(os.homedir(), '.config'));
  return path.join(configDir, 'bmark', 'bookmarks.json');
}

/**
 * Reads and returns the BookmarkStore from the given path.
 * If the file does not exist, returns an empty store.
 * Throws an error (with "corrupted" in the message) if the file is not valid JSON.
 */
export async function readStore(storePath: string = defaultStorePath()): Promise<BookmarkStore> {
  try {
    const raw = await fs.readFile(storePath, 'utf8');
    try {
      return JSON.parse(raw) as BookmarkStore;
    } catch {
      throw new Error(
        `Storage file is corrupted. Run \`bmark repair\` or delete ${storePath}.`,
      );
    }
  } catch (err: unknown) {
    if (isNodeError(err) && err.code === 'ENOENT') {
      return { version: STORE_VERSION, bookmarks: [] };
    }
    throw err;
  }
}

/**
 * Serializes and writes the BookmarkStore to disk, creating parent dirs as needed.
 */
export async function writeStore(
  store: BookmarkStore,
  storePath: string = defaultStorePath(),
): Promise<void> {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return (
    err !== null &&
    typeof err === 'object' &&
    'code' in (err as object)
  );
}
