---
description: "Task list for Bookmark CLI Tool implementation"
---

# Tasks: Bookmark CLI Tool

**Input**: Design documents from `specs/001-bookmark-cli/`  
**Prerequisites**: plan.md ✅, spec.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, config, and tooling inside `my-test-project/`

- [ ] T001 Create `my-test-project/src/` and `my-test-project/tests/unit/` and `my-test-project/tests/integration/` directories
- [ ] T002 Create `my-test-project/package.json` with `commander` dependency and `bmark` bin entry
- [ ] T003 [P] Create `my-test-project/tsconfig.json` with strict TypeScript config
- [ ] T004 [P] Create `my-test-project/jest.config.js` configured for `ts-jest`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, storage layer, validation, and formatting — all user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Create `src/types.ts` — define `Bookmark` and `BookmarkStore` interfaces
- [ ] T006 [P] Write unit tests `tests/unit/validate.test.ts` for URL validation (must fail first)
- [ ] T007 [P] Write unit tests `tests/unit/storage.test.ts` for read/write/repair (must fail first)
- [ ] T008 [P] Write unit tests `tests/unit/format.test.ts` for table and JSON output (must fail first)
- [ ] T009 Create `src/validate.ts` — URL validation, deduplication check (passes T006 tests)
- [ ] T010 Create `src/storage.ts` — read, write, create-if-missing, version, repair logic (passes T007 tests)
- [ ] T011 [P] Create `src/format.ts` — human-readable table formatter and JSON output helper (passes T008 tests)

**Checkpoint**: Foundation ready — storage, types, validation, formatting all tested and passing.

---

## Phase 3: User Story 1 — Add and Retrieve a Bookmark (Priority: P1) 🎯 MVP

**Goal**: Users can `bmark add <url>` and `bmark list`.

**Independent Test**: `bmark add https://example.com --title "Example" --tags dev` → `bmark list` shows entry.

### Tests for User Story 1

> **Write tests FIRST, confirm they FAIL before implementation**

- [ ] T012 [P] [US1] Write `tests/unit/commands/add.test.ts` — add bookmark, duplicate detection, title fallback
- [ ] T013 [P] [US1] Write `tests/unit/commands/list.test.ts` — list all, list with `--json`

### Implementation for User Story 1

- [ ] T014 [US1] Create `src/commands/add.ts` — `bmark add <url> [--title] [--tags]` (passes T012)
- [ ] T015 [US1] Create `src/commands/list.ts` — `bmark list [--json] [--tag]` (passes T013)
- [ ] T016 [US1] Create `src/cli.ts` — entry point, register `add` and `list` commands
- [ ] T017 [US1] Add `"bin": { "bmark": "dist/cli.js" }` and `build` script to `package.json`

**Checkpoint**: `bmark add` and `bmark list` fully functional. US1 independently testable.

---

## Phase 4: User Story 2 — Search and Filter Bookmarks (Priority: P2)

**Goal**: Users can `bmark search <query>` and `bmark list --tag <tag>`.

**Independent Test**: Add 3 bookmarks → `bmark search "typescript"` returns only matching ones.

### Tests for User Story 2

- [ ] T018 [P] [US2] Write `tests/unit/commands/search.test.ts` — keyword match, tag filter, no results

### Implementation for User Story 2

- [ ] T019 [US2] Create `src/commands/search.ts` — case-insensitive text search across title + URL (passes T018)
- [ ] T020 [US2] Update `src/commands/list.ts` to support `--tag <tag>` filter (update T013 tests too)
- [ ] T021 [US2] Register `search` command in `src/cli.ts`

**Checkpoint**: US1 + US2 independently functional. Tag filtering and full-text search working.

---

## Phase 5: User Story 3 — Delete a Bookmark (Priority: P3)

**Goal**: Users can `bmark delete <id>` to remove a bookmark.

**Independent Test**: Add → `bmark list` (get ID) → `bmark delete <id>` → `bmark list` shows it's gone.

### Tests for User Story 3

- [ ] T022 [P] [US3] Write `tests/unit/commands/delete.test.ts` — success, not-found error

### Implementation for User Story 3

- [ ] T023 [US3] Create `src/commands/delete.ts` — delete by ID, error on missing (passes T022)
- [ ] T024 [US3] Register `delete` command in `src/cli.ts`

**Checkpoint**: US1 + US2 + US3 all independently functional.

---

## Phase 6: User Story 4 — Export and Import Bookmarks (Priority: P4)

**Goal**: Users can `bmark export --out <path>` and `bmark import --file <path>`.

**Independent Test**: Export → clear store → import → list matches original.

### Tests for User Story 4

- [ ] T025 [P] [US4] Write `tests/unit/commands/export.test.ts` — writes file, correct count
- [ ] T026 [P] [US4] Write `tests/unit/commands/import.test.ts` — merge, dedup, error on bad JSON

### Implementation for User Story 4

- [ ] T027 [US4] Create `src/commands/export.ts` — write BookmarkStore.bookmarks to JSON file (passes T025)
- [ ] T028 [US4] Create `src/commands/import.ts` — read JSON file, merge without duplicates (passes T026)
- [ ] T029 [US4] Register `export` and `import` commands in `src/cli.ts`

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests, README, and final cleanup

- [ ] T030 [P] Write `tests/integration/cli.test.ts` — end-to-end test of full add → list → search → delete → export → import cycle using a temp directory
- [ ] T031 [P] Create `my-test-project/README.md` — quickstart, installation, usage examples for all commands
- [ ] T032 Add `npm run build` (tsc) and `npm test` verification pass
- [ ] T033 [P] Verify exit codes: 0 on success, 1 on error, across all commands

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend on Phase 2 completion; can proceed in priority order
- **Polish (Phase 7)**: Depends on all user story phases being complete

### Within Each User Story

- Tests MUST be written first and confirmed failing
- Types/models before services; services before commands
- Story complete before moving to next priority

### Parallel Opportunities

- T005, T006, T007, T008 can all run in parallel (different files)
- T009, T010, T011 can run in parallel (different files, same phase)
- T012, T013 can run in parallel
- T025, T026, T030, T031 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation (CRITICAL — blocks everything)
3. Complete Phase 3: User Story 1 (add + list)
4. **STOP and VALIDATE**: `bmark add https://example.com --title "Test" && bmark list`
5. Proceed to Phase 4 (search)

### Incremental Delivery

1. Foundation → US1 (add/list) → **Deploy/Demo**
2. Add US2 (search/filter) → **Demo**
3. Add US3 (delete) → **Demo**
4. Add US4 (export/import) → **Full release**
