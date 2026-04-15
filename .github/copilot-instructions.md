# Repository-wide Copilot Instructions

Use these rules for all files in this repository unless a more specific scoped instruction file applies.

## Core Rules

1. Prefer TypeScript for new source files and use strict typing (`any` is allowed only with a short justification comment).
2. Keep functions small and composable; if a function grows beyond ~40 lines, split it into helper functions.
3. Add or update tests for behavior changes. For bug fixes, include at least one regression test.
4. Avoid adding new dependencies unless there is a clear benefit and no lightweight built-in alternative.
