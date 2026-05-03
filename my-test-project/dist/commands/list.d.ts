import { Bookmark } from '../types';
export interface ListOptions {
    tag?: string;
}
/**
 * Returns all bookmarks, optionally filtered by a single tag.
 */
export declare function listBookmarks(options: ListOptions, storePath?: string): Promise<Bookmark[]>;
//# sourceMappingURL=list.d.ts.map