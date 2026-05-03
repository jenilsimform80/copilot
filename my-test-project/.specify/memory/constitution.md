# Bookmark CLI Constitution

## Core Principles

### I. CLI-First Design
Every feature is delivered as a composable CLI subcommand. Commands follow the pattern `bmark <verb> [args] [flags]`. Text output goes to stdout; errors and warnings go to stderr. Human-readable output is the default; JSON output is available via `--json` on every command.

### II. Single Responsibility per Command
Each subcommand does exactly one thing: `add`, `list`, `delete`, `search`, `tag`, `export`, `import`. No command mutates state AND queries state in the same operation. Commands are independently testable.

### III. Local-First Storage
All bookmark data is stored in a single JSON file in the user's config directory (`~/.config/bmark/bookmarks.json` on Linux/macOS, `%APPDATA%\bmark\bookmarks.json` on Windows). No network calls, no external databases. The storage format is versioned for forward compatibility.

### IV. Test-First (NON-NEGOTIABLE)
TDD mandatory: Tests are written first, confirmed to fail, then implementation is written to make them pass. Red-Green-Refactor cycle strictly enforced. Unit tests for all core logic; integration tests for CLI command behavior.

### V. Simplicity & YAGNI
Start with the minimum viable feature set. No premature abstraction. Add complexity only when a concrete need arises. Dependencies are introduced only when a built-in alternative does not exist or is impractical.

## Technology Constraints

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js ≥ 18
- **CLI Framework**: [commander](https://github.com/tj/commander.js) — lightweight, no heavyweight frameworks
- **Testing**: Jest with ts-jest
- **Storage**: JSON file via Node.js `fs/promises` — no ORM, no SQLite
- **No external HTTP calls** during normal operation

## Development Workflow

1. Feature spec created before any code is written (`spec.md`)
2. Implementation plan reviewed and approved (`plan.md`)
3. Atomic task list generated (`tasks.md`)
4. Tests written and confirmed failing
5. Implementation written to pass tests
6. Documentation updated inline with change

## Governance

This constitution supersedes all other practices. Amendments require a PR that updates this file with a new version, a rationale comment, and a migration note if existing behavior changes. All code reviews must verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-05-03 | **Last Amended**: 2026-05-03
