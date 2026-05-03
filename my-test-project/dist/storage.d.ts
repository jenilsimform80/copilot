import { BookmarkStore } from './types';
/**
 * Returns the default path to the bookmarks JSON file.
 * Follows XDG Base Directory spec on Linux/macOS.
 */
export declare function defaultStorePath(): string;
/**
 * Reads and returns the BookmarkStore from the given path.
 * If the file does not exist, returns an empty store.
 * Throws an error (with "corrupted" in the message) if the file is not valid JSON.
 */
export declare function readStore(storePath?: string): Promise<BookmarkStore>;
/**
 * Serializes and writes the BookmarkStore to disk, creating parent dirs as needed.
 */
export declare function writeStore(store: BookmarkStore, storePath?: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map