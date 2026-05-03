"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBookmarks = listBookmarks;
const storage_1 = require("../storage");
/**
 * Returns all bookmarks, optionally filtered by a single tag.
 */
async function listBookmarks(options, storePath) {
    const store = await (0, storage_1.readStore)(storePath);
    const { tag } = options;
    if (tag) {
        return store.bookmarks.filter((b) => b.tags.includes(tag.toLowerCase()));
    }
    return store.bookmarks;
}
//# sourceMappingURL=list.js.map