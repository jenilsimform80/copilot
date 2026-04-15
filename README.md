# copilot

## Copilot Instructions Setup

This repository includes both global and scoped Copilot instruction files:

- `.github/copilot-instructions.md` (global rules for the whole repository)
- `.github/instructions/frontend.instructions.md` (scoped rules with `applyTo: "src/components/**/*.tsx"`)

### Verification

Use these two files to verify instruction scope behavior:

- `src/components/SampleCard.tsx` should receive both global + frontend scoped instructions.
- `src/server/health.ts` should receive only global instructions.

Suggested verification prompts in Copilot Chat:

1. Ask Copilot to refactor `src/components/SampleCard.tsx` and confirm it favors typed React props and accessibility.
2. Ask Copilot to change `src/server/health.ts` and confirm frontend-specific rules are not applied.