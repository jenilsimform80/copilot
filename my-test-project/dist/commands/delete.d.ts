export interface DeleteResult {
    deleted: boolean;
    notFound?: boolean;
}
/**
 * Removes a bookmark by its ID.
 * Returns { deleted: false, notFound: true } if no bookmark has the given ID.
 */
export declare function deleteBookmark(id: string, storePath?: string): Promise<DeleteResult>;
//# sourceMappingURL=delete.d.ts.map