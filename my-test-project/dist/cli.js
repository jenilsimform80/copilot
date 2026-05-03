#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const add_1 = require("./commands/add");
const list_1 = require("./commands/list");
const search_1 = require("./commands/search");
const delete_1 = require("./commands/delete");
const export_1 = require("./commands/export");
const import_1 = require("./commands/import");
const format_1 = require("./format");
const program = new commander_1.Command();
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
    .action(async (url, opts) => {
    try {
        const tags = opts.tags ? opts.tags.split(',') : [];
        const result = await (0, add_1.addBookmark)({ url, title: opts.title, tags });
        if (result.duplicate) {
            console.warn(`Already exists: ${url}`);
        }
        else {
            console.log(`Saved: ${result.title} <${url}>${result.id ? ` [id: ${result.id}]` : ''}`);
        }
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
// bmark list [--tag <tag>] [--json]
program
    .command('list')
    .description('List all bookmarks')
    .option('--tag <tag>', 'Filter by tag')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
    try {
        const bookmarks = await (0, list_1.listBookmarks)({ tag: opts.tag });
        if (opts.json) {
            console.log((0, format_1.formatJson)(bookmarks));
        }
        else {
            console.log((0, format_1.formatTable)(bookmarks));
        }
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
// bmark search <query>
program
    .command('search <query>')
    .description('Search bookmarks by keyword (title or URL)')
    .option('--json', 'Output as JSON')
    .action(async (query, opts) => {
    try {
        const bookmarks = await (0, search_1.searchBookmarks)(query);
        if (opts.json) {
            console.log((0, format_1.formatJson)(bookmarks));
        }
        else {
            console.log((0, format_1.formatTable)(bookmarks));
        }
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
// bmark delete <id>
program
    .command('delete <id>')
    .description('Delete a bookmark by ID')
    .action(async (id) => {
    try {
        const result = await (0, delete_1.deleteBookmark)(id);
        if (result.notFound) {
            console.error(`Not found: ${id}`);
            process.exit(1);
        }
        else {
            console.log(`Deleted: ${id}`);
        }
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
// bmark export --out <path>
program
    .command('export')
    .description('Export all bookmarks to a JSON file')
    .requiredOption('--out <path>', 'Output file path')
    .action(async (opts) => {
    try {
        const result = await (0, export_1.exportBookmarks)(opts.out);
        console.log(`Exported ${result.count} bookmarks to ${result.outPath}`);
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
// bmark import --file <path>
program
    .command('import')
    .description('Import bookmarks from a JSON file')
    .requiredOption('--file <path>', 'Input file path')
    .action(async (opts) => {
    try {
        const result = await (0, import_1.importBookmarks)(opts.file);
        console.log(`Imported ${result.imported} bookmarks (${result.skipped} skipped as duplicates)`);
    }
    catch (err) {
        console.error(err.message);
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map