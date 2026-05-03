"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBookmarks = searchBookmarks;
const storage_1 = require("../storage");
/**
 * Searches bookmarks by a case-insensitive keyword against title and URL.
 */
async function searchBookmarks(query, storePath) {
    const store = await (0, storage_1.readStore)(storePath);
    const lower = query.toLowerCase();
    return store.bookmarks.filter((b) => b.title.toLowerCase().includes(lower) || b.url.toLowerCase().includes(lower));
}
//# sourceMappingURL=search.js.map