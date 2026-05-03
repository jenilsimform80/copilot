/**
 * Input validation utilities.
 */
/**
 * Returns true if the string is a valid http or https URL.
 */
export declare function isValidUrl(value: string): boolean;
/**
 * Splits a comma-separated tag string, trims whitespace, lowercases, and removes empties.
 */
export declare function normalizeTags(raw: string): string[];
/**
 * Derives a display title from a URL when the user does not provide one.
 * Returns the hostname with the "www." prefix stripped.
 */
export declare function titleFromUrl(url: string): string;
//# sourceMappingURL=validate.d.ts.map