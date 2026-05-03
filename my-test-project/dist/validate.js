"use strict";
/**
 * Input validation utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUrl = isValidUrl;
exports.normalizeTags = normalizeTags;
exports.titleFromUrl = titleFromUrl;
/**
 * Returns true if the string is a valid http or https URL.
 */
function isValidUrl(value) {
    if (!value)
        return false;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch {
        return false;
    }
}
/**
 * Splits a comma-separated tag string, trims whitespace, lowercases, and removes empties.
 */
function normalizeTags(raw) {
    if (!raw)
        return [];
    return raw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
}
/**
 * Derives a display title from a URL when the user does not provide one.
 * Returns the hostname with the "www." prefix stripped.
 */
function titleFromUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, '');
    }
    catch {
        return url;
    }
}
//# sourceMappingURL=validate.js.map