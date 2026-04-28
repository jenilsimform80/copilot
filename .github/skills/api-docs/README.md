# Agent Skill: API Documentation Generator

This skill teaches GitHub Copilot how to generate and maintain REST API
documentation for the Express + TypeScript server in `src/server/`.

---

## Files

| File | Purpose |
|------|---------|
| `instructions.md` | Skill instruction file consumed by Copilot. Contains rules for JSDoc generation, OpenAPI entry generation, and doc validation. |
| `generate-api-docs.ts` | Supporting script. Scans `src/server/` and writes a complete `docs/openapi.yaml`. |
| `README.md` | This file. |

---

## How to use

### 1 — Ask Copilot to document a new handler

Open a new or modified route handler in `src/server/`, then ask:

```
@api-docs Generate JSDoc and an OpenAPI entry for this handler.
```

Copilot will follow the rules in `instructions.md` to produce:
- A complete JSDoc block (summary, `@route`, `@example` request/response blocks).
- The matching OpenAPI 3.0 path entry.

### 2 — Validate existing documentation

Ask Copilot:

```
@api-docs Validate the documentation in src/server/userControllers.ts.
```

Copilot will compare each `@example` block against the TypeScript types and
report any discrepancies.

### 3 — Regenerate docs/openapi.yaml

Run the supporting script from the repository root:

```bash
npx ts-node .github/skills/api-docs/generate-api-docs.ts
```

This produces (or overwrites) `docs/openapi.yaml` with an up-to-date OpenAPI
3.0 document derived from JSDoc `@route` annotations and exported TypeScript
interfaces in `src/server/`.

---

## Design decisions

- **Dependency-light**: the script uses only the TypeScript compiler API
  (`typescript` package, already a dev dependency) and the Node.js standard
  library — no extra packages are required.
- **Incremental**: the script is safe to re-run at any time; it overwrites only
  `docs/openapi.yaml`.
- **Convention-over-configuration**: route paths and HTTP methods come from
  `@route` JSDoc tags so that the script does not need to parse Express router
  calls.
