"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBookmark = addBookmark;
const crypto_1 = require("crypto");
const storage_1 = require("../storage");
const validate_1 = require("../validate");
/**
 * Adds a new bookmark to the store.
 * Returns { added: false, duplicate: true } if the URL already exists.
 * Throws if the URL is invalid.
 */
async function addBookmark(options, storePath) {
    const { url, title, tags = [] } = options;
    if (!(0, validate_1.isValidUrl)(url)) {
        throw new Error(`Invalid URL: ${url}`);
    }
    const store = await (0, storage_1.readStore)(storePath);
    const existing = store.bookmarks.find((b) => b.url === url);
    if (existing) {
        return { added: false, duplicate: true };
    }
    const id = (0, crypto_1.randomBytes)(4).toString('hex'); // 8 hex chars
    const resolvedTitle = title?.trim() || (0, validate_1.titleFromUrl)(url);
    const normalizedTags = (0, validate_1.normalizeTags)(tags.join(','));
    store.bookmarks.push({
        id,
        url,
        title: resolvedTitle,
        tags: normalizedTags,
        createdAt: new Date().toISOString(),
    });
    await (0, storage_1.writeStore)(store, storePath);
    return { added: true, id, title: resolvedTitle };
}
//# sourceMappingURL=add.js.map