import { isValidUrl, normalizeTags, titleFromUrl } from '../../src/validate';

describe('isValidUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('accepts https URLs', () => {
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('rejects ftp URLs', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('rejects plain strings', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('rejects empty strings', () => {
    expect(isValidUrl('')).toBe(false);
  });
});

describe('normalizeTags', () => {
  it('trims whitespace from each tag', () => {
    expect(normalizeTags(' dev , ref ')).toEqual(['dev', 'ref']);
  });

  it('removes empty tags', () => {
    expect(normalizeTags('dev,,ref')).toEqual(['dev', 'ref']);
  });

  it('returns empty array for empty string', () => {
    expect(normalizeTags('')).toEqual([]);
  });

  it('lowercases tags', () => {
    expect(normalizeTags('Dev,TypeScript')).toEqual(['dev', 'typescript']);
  });
});

describe('titleFromUrl', () => {
  it('returns hostname when title is absent', () => {
    expect(titleFromUrl('https://github.com/some/repo')).toBe('github.com');
  });

  it('strips www prefix', () => {
    expect(titleFromUrl('https://www.example.com')).toBe('example.com');
  });
});
