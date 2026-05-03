/**
 * Input validation utilities.
 */

/**
 * Returns true if the string is a valid http or https URL.
 */
export function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Splits a comma-separated tag string, trims whitespace, lowercases, and removes empties.
 */
export function normalizeTags(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

/**
 * Derives a display title from a URL when the user does not provide one.
 * Returns the hostname with the "www." prefix stripped.
 */
export function titleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
