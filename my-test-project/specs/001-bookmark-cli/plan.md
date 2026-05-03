# Implementation Plan: Bookmark CLI Tool

**Branch**: `001-bookmark-cli` | **Date**: 2026-05-03 | **Spec**: `specs/001-bookmark-cli/spec.md`  
**Input**: Feature specification from `specs/001-bookmark-cli/spec.md`

## Summary

Build `bmark`, a local-first CLI tool in TypeScript that lets users add, list, search, delete, export, and import bookmarks stored in a versioned JSON file. The tool follows commander-based subcommand architecture, strict TypeScript types, and Jest-based TDD.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js ≥ 18  
**Primary Dependencies**: `commander` (CLI framework), `@types/node`  
**Storage**: JSON file at `~/.config/bmark/bookmarks.json` via `fs/promises`  
**Testing**: Jest with `ts-jest`  
**Target Platform**: Linux / macOS / Windows (Node.js cross-platform)  
**Project Type**: CLI tool  
**Performance Goals**: <100ms per command for collections ≤ 10k bookmarks  
**Constraints**: No network calls; no external DB; single JSON file  
**Scale/Scope**: Single user, up to ~10k bookmarks

## Constitution Check

- ✅ CLI-First Design — all features delivered as subcommands
- ✅ Single Responsibility — one action per command
- ✅ Local-First Storage — JSON file, no external dependencies
- ✅ Test-First — Jest TDD enforced by task order
- ✅ Simplicity — `commander` only; no ORM; plain JSON

## Project Structure

### Documentation (this feature)

```text
specs/001-bookmark-cli/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
└── tasks.md             # Task list (/speckit.tasks output)
```

### Source Code

```text
my-test-project/
├── src/
│   ├── cli.ts           # Entry point — registers commander program + subcommands
│   ├── commands/
│   │   ├── add.ts       # `bmark add` subcommand
│   │   ├── list.ts      # `bmark list` subcommand
│   │   ├── search.ts    # `bmark search` subcommand
│   │   ├── delete.ts    # `bmark delete` subcommand
│   │   ├── export.ts    # `bmark export` subcommand
│   │   └── import.ts    # `bmark import` subcommand
│   ├── storage.ts       # Read/write BookmarkStore from/to disk
│   ├── types.ts         # Bookmark, BookmarkStore types
│   ├── validate.ts      # URL validation, input sanitization
│   └── format.ts        # Human-readable table + JSON output helpers
├── tests/
│   ├── unit/
│   │   ├── storage.test.ts
│   │   ├── validate.test.ts
│   │   ├── format.test.ts
│   │   └── commands/
│   │       ├── add.test.ts
│   │       ├── list.test.ts
│   │       ├── search.test.ts
│   │       ├── delete.test.ts
│   │       ├── export.test.ts
│   │       └── import.test.ts
│   └── integration/
│       └── cli.test.ts  # End-to-end command invocation tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

**Structure Decision**: Single project layout. All source under `src/`, all tests under `tests/`. This matches the repository's existing pattern.

## Complexity Tracking

No constitution violations. No unusual complexity.
