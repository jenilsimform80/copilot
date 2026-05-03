# bmark — CLI Bookmark Organizer

`bmark` is a local-first command-line tool to save, search, and organize your bookmarks in a plain JSON file. No cloud sync, no browser extension — just fast, scriptable bookmarks in your terminal.

## Requirements

- Node.js ≥ 18
- npm

## Installation

```bash
cd my-test-project
npm install
npm run build
npm link   # makes `bmark` available globally
```

## Quick Start

```bash
# Add a bookmark
bmark add https://typescriptlang.org --title "TypeScript" --tags dev,ts

# List all bookmarks
bmark list

# List as JSON (for scripting)
bmark list --json

# Filter by tag
bmark list --tag dev

# Search by keyword
bmark search "typescript"

# Delete a bookmark by ID
bmark delete abc12345

# Export bookmarks to a file
bmark export --out ~/bmarks-backup.json

# Import bookmarks from a file
bmark import --file ~/bmarks-backup.json
```

## Storage

Bookmarks are stored at:

- **Linux / macOS**: `~/.config/bmark/bookmarks.json`
- **Windows**: `%APPDATA%\bmark\bookmarks.json`

The file is human-readable JSON and can be edited directly.

## Commands

| Command | Description |
|---------|-------------|
| `bmark add <url> [--title <t>] [--tags <t1,t2>]` | Add a bookmark |
| `bmark list [--tag <tag>] [--json]` | List bookmarks (optionally filtered) |
| `bmark search <query>` | Search by keyword (title or URL) |
| `bmark delete <id>` | Delete a bookmark by ID |
| `bmark export --out <path>` | Export bookmarks to JSON file |
| `bmark import --file <path>` | Import bookmarks from JSON file |

## Development

```bash
npm test          # Run all unit and integration tests
npm run build     # Compile TypeScript to dist/
```

## Data Model

```json
{
  "version": 1,
  "bookmarks": [
    {
      "id": "a1b2c3d4",
      "url": "https://example.com",
      "title": "Example",
      "tags": ["dev", "ref"],
      "createdAt": "2026-05-03T00:00:00.000Z"
    }
  ]
}
```

## Spec-Driven Development

This project was built using [spec-kit](https://github.com/github/spec-kit) spec-driven workflow:

- **Constitution**: `.specify/memory/constitution.md` — core principles and technology constraints
- **Specification**: `specs/001-bookmark-cli/spec.md` — user stories and requirements
- **Plan**: `specs/001-bookmark-cli/plan.md` — technical design and project structure
- **Tasks**: `specs/001-bookmark-cli/tasks.md` — phased, prioritized task list
