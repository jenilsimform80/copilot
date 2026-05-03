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
export declare function addBookmark(options: AddOptions, storePath?: string): Promise<AddResult>;
//# sourceMappingURL=add.d.ts.map