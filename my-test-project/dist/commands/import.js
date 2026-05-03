"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importBookmarks = importBookmarks;
const fs = __importStar(require("fs/promises"));
const storage_1 = require("../storage");
/**
 * Imports bookmarks from a JSON file, merging without duplicating existing URLs.
 * Throws if the import file is missing or contains invalid JSON.
 */
async function importBookmarks(filePath, storePath) {
    const raw = await fs.readFile(filePath, 'utf8');
    let incoming;
    try {
        incoming = JSON.parse(raw);
    }
    catch {
        throw new Error(`Import file is not valid JSON: ${filePath}`);
    }
    if (!Array.isArray(incoming)) {
        throw new Error(`Import file must contain a JSON array of bookmarks.`);
    }
    const store = await (0, storage_1.readStore)(storePath);
    const existingUrls = new Set(store.bookmarks.map((b) => b.url));
    let imported = 0;
    let skipped = 0;
    for (const bookmark of incoming) {
        if (existingUrls.has(bookmark.url)) {
            skipped++;
        }
        else {
            store.bookmarks.push(bookmark);
            existingUrls.add(bookmark.url);
            imported++;
        }
    }
    await (0, storage_1.writeStore)(store, storePath);
    return { imported, skipped };
}
//# sourceMappingURL=import.js.map