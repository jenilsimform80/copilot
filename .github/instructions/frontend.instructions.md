---
applyTo: "src/components/**/*.tsx"
---

# Frontend Scoped Copilot Instructions (React + TypeScript)

Apply these rules when editing files matched by `src/components/**/*.tsx`.

1. Build components as typed React function components with explicit `Props` interfaces.
2. Use accessible markup first: semantic HTML, keyboard support, and clear `aria-*` labels when needed.
3. Prefer local component state (`useState`, `useMemo`, `useCallback`) over global state unless shared behavior requires it.
4. Keep styling consistent with existing patterns (CSS modules or existing utility classes); do not introduce inline style objects except for truly dynamic values.
5. For async UI actions, include loading and error states in the component output.
