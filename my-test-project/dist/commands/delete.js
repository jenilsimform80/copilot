"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBookmark = deleteBookmark;
const storage_1 = require("../storage");
/**
 * Removes a bookmark by its ID.
 * Returns { deleted: false, notFound: true } if no bookmark has the given ID.
 */
async function deleteBookmark(id, storePath) {
    const store = await (0, storage_1.readStore)(storePath);
    const index = store.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) {
        return { deleted: false, notFound: true };
    }
    store.bookmarks.splice(index, 1);
    await (0, storage_1.writeStore)(store, storePath);
    return { deleted: true };
}
//# sourceMappingURL=delete.js.map