# Feature Specification: Bookmark CLI Tool

**Feature Branch**: `001-bookmark-cli`  
**Created**: 2026-05-03  
**Status**: Approved  
**Input**: User description: "a CLI tool to organize bookmarks"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add and Retrieve a Bookmark (Priority: P1)

As a developer or power user, I want to save a URL with a title and optional tags so I can retrieve it later without hunting through my browser history.

**Why this priority**: Core value proposition. Without add/list, no other feature matters. This is the MVP.

**Independent Test**: Run `bmark add https://example.com --title "Example" --tags dev,ref` then `bmark list` and verify the bookmark appears with correct metadata.

**Acceptance Scenarios**:

1. **Given** no bookmarks exist, **When** I run `bmark add https://example.com --title "Example" --tags dev`, **Then** the bookmark is saved and the CLI prints `Saved: Example <https://example.com> [dev]`
2. **Given** a bookmark already exists with the same URL, **When** I run `bmark add https://example.com`, **Then** the CLI prints a warning `Already exists: https://example.com` and exits without duplicating.
3. **Given** one or more bookmarks exist, **When** I run `bmark list`, **Then** all bookmarks are printed in a human-readable table (ID, title, URL, tags).
4. **Given** one or more bookmarks exist, **When** I run `bmark list --json`, **Then** output is valid JSON array of bookmark objects.

---

### User Story 2 - Search and Filter Bookmarks (Priority: P2)

As a user with many saved bookmarks, I want to search by keyword or filter by tag so I can quickly find the bookmark I need.

**Why this priority**: Without search, a large collection becomes unusable. Comes right after basic add/list.

**Independent Test**: Add 3 bookmarks with varied titles/tags, run `bmark search "typescript"` and `bmark list --tag dev`, verify only matching bookmarks are returned.

**Acceptance Scenarios**:

1. **Given** bookmarks exist, **When** I run `bmark search "typescript"`, **Then** only bookmarks whose title or URL contains "typescript" (case-insensitive) are printed.
2. **Given** bookmarks exist with tags, **When** I run `bmark list --tag dev`, **Then** only bookmarks tagged with "dev" are printed.
3. **Given** no matching results, **When** I run `bmark search "xyznotfound"`, **Then** the CLI prints `No bookmarks found.` and exits 0.

---

### User Story 3 - Delete a Bookmark (Priority: P3)

As a user, I want to remove bookmarks I no longer need so my collection stays tidy.

**Why this priority**: Important for hygiene, but not blocking the core add/list/search workflow.

**Independent Test**: Add a bookmark, get its ID from `bmark list`, run `bmark delete <id>`, then `bmark list` and confirm it is gone.

**Acceptance Scenarios**:

1. **Given** a bookmark with id `abc123`, **When** I run `bmark delete abc123`, **Then** it is removed and CLI prints `Deleted: abc123`.
2. **Given** no bookmark with id `xyz`, **When** I run `bmark delete xyz`, **Then** CLI prints `Not found: xyz` to stderr and exits 1.

---

### User Story 4 - Export and Import Bookmarks (Priority: P4)

As a user, I want to export my bookmarks to a JSON file and import them back so I can back up and restore my collection.

**Why this priority**: Data portability matters for power users but is not core to daily usage.

**Independent Test**: Export to `/tmp/bmarks.json`, clear the store, import from the file, verify the bookmark list matches the original export.

**Acceptance Scenarios**:

1. **Given** bookmarks exist, **When** I run `bmark export --out /tmp/bmarks.json`, **Then** the file is written and CLI prints `Exported N bookmarks to /tmp/bmarks.json`.
2. **Given** a valid export file, **When** I run `bmark import --file /tmp/bmarks.json`, **Then** bookmarks are merged into the store and CLI prints `Imported N bookmarks`.
3. **Given** a malformed JSON file, **When** I run `bmark import --file /tmp/bad.json`, **Then** CLI prints an error to stderr and exits 1 without modifying the store.

---

### Edge Cases

- What happens when the bookmarks storage file is corrupted (invalid JSON)?  
  → CLI prints `Error: storage file is corrupted. Run \`bmark repair\` or delete ~/.config/bmark/bookmarks.json.` to stderr and exits 1.
- What happens when `--title` is omitted on `bmark add`?  
  → The URL's hostname is used as the title automatically.
- What happens when adding a URL that is not a valid HTTP/HTTPS URL?  
  → CLI prints `Invalid URL: <value>` to stderr and exits 1.
- What happens if the config directory does not exist?  
  → It is created automatically on first run.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to add a bookmark with a URL, optional title, and optional comma-separated tags via `bmark add <url> [--title <title>] [--tags <tags>]`.
- **FR-002**: System MUST validate that the provided URL starts with `http://` or `https://`.
- **FR-003**: System MUST assign a unique short ID to each bookmark on creation.
- **FR-004**: System MUST prevent duplicate URLs; attempting to add an existing URL MUST print a warning and not create a duplicate.
- **FR-005**: System MUST list all bookmarks via `bmark list` with human-readable table output by default and `--json` flag for machine-readable output.
- **FR-006**: System MUST support filtering the list by tag via `bmark list --tag <tag>`.
- **FR-007**: System MUST support full-text search across title and URL via `bmark search <query>`.
- **FR-008**: System MUST allow deletion by ID via `bmark delete <id>`.
- **FR-009**: System MUST export all bookmarks to a JSON file via `bmark export --out <path>`.
- **FR-010**: System MUST import bookmarks from a JSON file via `bmark import --file <path>`, merging without duplicating.
- **FR-011**: System MUST persist data to `~/.config/bmark/bookmarks.json` (XDG-compliant path on Linux/macOS).

### Key Entities

- **Bookmark**: Represents a saved URL. Attributes: `id` (string, unique 8-char hex), `url` (string), `title` (string), `tags` (string[]), `createdAt` (ISO 8601 string).
- **BookmarkStore**: The in-memory representation of the full collection. Serialized as `{ version: number, bookmarks: Bookmark[] }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can add a bookmark in a single command in under 100ms on a modern laptop.
- **SC-002**: `bmark list` renders up to 1,000 bookmarks without truncation or performance issues.
- **SC-003**: `bmark search` correctly returns all matching bookmarks for a given query string with 100% recall.
- **SC-004**: All commands produce non-zero exit codes on error and zero exit codes on success.
- **SC-005**: Unit test coverage ≥ 80% on all core modules (storage, validation, formatting).

## Assumptions

- Users are on a system with Node.js ≥ 18 installed.
- The tool is invoked as `bmark` after being linked via `npm link` or installed globally.
- Mobile support is out of scope for v1.
- Browser extension integration is out of scope for v1.
- Multi-user / sync across machines is out of scope for v1.
