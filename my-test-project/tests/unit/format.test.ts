import { formatTable, formatJson } from '../../src/format';
import { Bookmark } from '../../src/types';

const bookmarks: Bookmark[] = [
  { id: 'abc12345', url: 'https://example.com', title: 'Example', tags: ['dev', 'ref'], createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'def67890', url: 'https://github.com', title: 'GitHub', tags: [], createdAt: '2026-01-02T00:00:00.000Z' },
];

describe('formatTable', () => {
  it('includes the ID column', () => {
    const output = formatTable(bookmarks);
    expect(output).toContain('abc12345');
    expect(output).toContain('def67890');
  });

  it('includes the title column', () => {
    const output = formatTable(bookmarks);
    expect(output).toContain('Example');
    expect(output).toContain('GitHub');
  });

  it('includes the URL column', () => {
    const output = formatTable(bookmarks);
    expect(output).toContain('https://example.com');
  });

  it('includes tags', () => {
    const output = formatTable(bookmarks);
    expect(output).toContain('dev');
  });

  it('shows "No bookmarks found." for empty list', () => {
    const output = formatTable([]);
    expect(output).toBe('No bookmarks found.');
  });
});

describe('formatJson', () => {
  it('returns a valid JSON string', () => {
    const output = formatJson(bookmarks);
    const parsed = JSON.parse(output) as Bookmark[];
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('abc12345');
  });
});
