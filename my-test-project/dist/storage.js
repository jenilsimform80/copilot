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
exports.defaultStorePath = defaultStorePath;
exports.readStore = readStore;
exports.writeStore = writeStore;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const STORE_VERSION = 1;
/**
 * Returns the default path to the bookmarks JSON file.
 * Follows XDG Base Directory spec on Linux/macOS.
 */
function defaultStorePath() {
    const configDir = process.env['XDG_CONFIG_HOME'] ??
        (process.platform === 'win32'
            ? process.env['APPDATA'] ?? path.join(os.homedir(), 'AppData', 'Roaming')
            : path.join(os.homedir(), '.config'));
    return path.join(configDir, 'bmark', 'bookmarks.json');
}
/**
 * Reads and returns the BookmarkStore from the given path.
 * If the file does not exist, returns an empty store.
 * Throws an error (with "corrupted" in the message) if the file is not valid JSON.
 */
async function readStore(storePath = defaultStorePath()) {
    try {
        const raw = await fs.readFile(storePath, 'utf8');
        try {
            return JSON.parse(raw);
        }
        catch {
            throw new Error(`Storage file is corrupted. Run \`bmark repair\` or delete ${storePath}.`);
        }
    }
    catch (err) {
        if (isNodeError(err) && err.code === 'ENOENT') {
            return { version: STORE_VERSION, bookmarks: [] };
        }
        throw err;
    }
}
/**
 * Serializes and writes the BookmarkStore to disk, creating parent dirs as needed.
 */
async function writeStore(store, storePath = defaultStorePath()) {
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}
function isNodeError(err) {
    return (err !== null &&
        typeof err === 'object' &&
        'code' in err);
}
//# sourceMappingURL=storage.js.map