#!/usr/bin/env node
import { Command } from 'commander';
import { addBookmark } from './commands/add';
import { listBookmarks } from './commands/list';
import { searchBookmarks } from './commands/search';
import { deleteBookmark } from './commands/delete';
import { exportBookmarks } from './commands/export';
import { importBookmarks } from './commands/import';
import { formatTable, formatJson } from './format';

const program = new Command();

program
  .name('bmark')
  .description('A CLI tool to organize bookmarks')
  .version('1.0.0');

// bmark add <url> [--title <title>] [--tags <tags>]
program
  .command('add <url>')
  .description('Add a new bookmark')
  .option('-t, --title <title>', 'Bookmark title (defaults to hostname)')
  .option('--tags <tags>', 'Comma-separated tags')
  .action(async (url: string, opts: { title?: string; tags?: string }) => {
    try {
      const tags = opts.tags ? opts.tags.split(',') : [];
      const result = await addBookmark({ url, title: opts.title, tags });
      if (result.duplicate) {
        console.warn(`Already exists: ${url}`);
      } else {
        console.log(`Saved: ${result.title} <${url}>${result.id ? ` [id: ${result.id}]` : ''}`);
      }
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// bmark list [--tag <tag>] [--json]
program
  .command('list')
  .description('List all bookmarks')
  .option('--tag <tag>', 'Filter by tag')
  .option('--json', 'Output as JSON')
  .action(async (opts: { tag?: string; json?: boolean }) => {
    try {
      const bookmarks = await listBookmarks({ tag: opts.tag });
      if (opts.json) {
        console.log(formatJson(bookmarks));
      } else {
        console.log(formatTable(bookmarks));
      }
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// bmark search <query>
program
  .command('search <query>')
  .description('Search bookmarks by keyword (title or URL)')
  .option('--json', 'Output as JSON')
  .action(async (query: string, opts: { json?: boolean }) => {
    try {
      const bookmarks = await searchBookmarks(query);
      if (opts.json) {
        console.log(formatJson(bookmarks));
      } else {
        console.log(formatTable(bookmarks));
      }
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// bmark delete <id>
program
  .command('delete <id>')
  .description('Delete a bookmark by ID')
  .action(async (id: string) => {
    try {
      const result = await deleteBookmark(id);
      if (result.notFound) {
        console.error(`Not found: ${id}`);
        process.exit(1);
      } else {
        console.log(`Deleted: ${id}`);
      }
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// bmark export --out <path>
program
  .command('export')
  .description('Export all bookmarks to a JSON file')
  .requiredOption('--out <path>', 'Output file path')
  .action(async (opts: { out: string }) => {
    try {
      const result = await exportBookmarks(opts.out);
      console.log(`Exported ${result.count} bookmarks to ${result.outPath}`);
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

// bmark import --file <path>
program
  .command('import')
  .description('Import bookmarks from a JSON file')
  .requiredOption('--file <path>', 'Input file path')
  .action(async (opts: { file: string }) => {
    try {
      const result = await importBookmarks(opts.file);
      console.log(`Imported ${result.imported} bookmarks (${result.skipped} skipped as duplicates)`);
    } catch (err: unknown) {
      console.error((err as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);
