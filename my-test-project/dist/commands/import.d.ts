export interface ImportResult {
    imported: number;
    skipped: number;
}
/**
 * Imports bookmarks from a JSON file, merging without duplicating existing URLs.
 * Throws if the import file is missing or contains invalid JSON.
 */
export declare function importBookmarks(filePath: string, storePath?: string): Promise<ImportResult>;
//# sourceMappingURL=import.d.ts.map