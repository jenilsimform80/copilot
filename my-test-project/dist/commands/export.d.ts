export interface ExportResult {
    count: number;
    outPath: string;
}
/**
 * Exports all bookmarks to a JSON file at the given output path.
 */
export declare function exportBookmarks(outPath: string, storePath?: string): Promise<ExportResult>;
//# sourceMappingURL=export.d.ts.map