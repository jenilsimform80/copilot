---
name: api-docs
description: >
  Generate and maintain API documentation for Express route handlers.
  Produces JSDoc comments, OpenAPI 3.0 entries, and validates that
  existing documentation is accurate and complete.
applyTo: "src/server/**/*.ts"
---

# Skill: API Documentation Generator

## Purpose

Help developers keep REST API documentation in sync with the Express + TypeScript
source code in `src/server/`. The skill covers three tasks:

1. **Generate JSDoc** – add or refresh JSDoc comments on route handlers.
2. **Generate OpenAPI stubs** – emit an OpenAPI 3.0 YAML entry for each handler.
3. **Validate existing docs** – flag JSDoc/OpenAPI entries that are missing,
   stale, or inconsistent with the TypeScript types.

---

## When to invoke

Use `@api-docs` (or ask Copilot to "run the api-docs skill") when:

- Writing a new Express route handler.
- Changing request/response TypeScript types.
- Reviewing a pull request that touches `src/server/`.
- Running `npx ts-node .github/skills/api-docs/generate-api-docs.ts` to
  regenerate the `docs/openapi.yaml` file.

---

## Rules for JSDoc generation

When generating or updating a JSDoc block for a route handler, follow these rules:

1. **Summary line** – one sentence describing what the endpoint does.
2. **`@route`** – HTTP method and path, e.g. `@route POST /api/users`.
3. **`@param`** – list every path/query parameter with its TypeScript type and a
   short description.
4. **`@example` request** – show a realistic JSON body (use the corresponding
   `*Request` interface as the schema).
5. **`@example` success response** – show the HTTP status code and a realistic
   JSON body (use the corresponding `*Response` interface).
6. **`@example` error response** – show at least one error case (400 validation
   failure, 409 conflict, 500 server error) using the `ApiError` shape.
7. **Do not duplicate** information already present in TypeScript types — rely on
   the types and only add doc where they do not speak for themselves.

### Template

```ts
/**
 * <One-sentence summary>.
 *
 * @route <METHOD> <path>
 *
 * @example Request body:
 * {
 *   "<field>": <example value>
 * }
 *
 * @example Success response (<status>):
 * {
 *   "<field>": <example value>
 * }
 *
 * @example Error response (<status>):
 * {
 *   "status": <status>,
 *   "message": "<human-readable message>",
 *   "details": [{ "field": "<field>", "message": "<reason>" }]
 * }
 */
export async function myHandler(req, res, next) { … }
```

---

## Rules for OpenAPI 3.0 entry generation

When producing an OpenAPI path entry from a handler, follow these rules:

1. Derive the **operationId** from the function name in camelCase, stripping the
   `Handler` suffix (e.g. `createUserHandler` → `createUser`).
2. Map TypeScript union literals (`'admin' | 'user' | 'guest'`) to OpenAPI
   `enum` arrays.
3. Mark optional TypeScript fields (`field?: Type`) as not required in the
   OpenAPI schema.
4. Use `$ref` to a named component schema whenever the same type appears in more
   than one place.
5. Always include a `400` response object for endpoints that call
   `validateCreateUserRequest` or any other validation helper.
6. Always include a `500` response using the shared `InternalServerError`
   component.

---

## Rules for validation

When asked to validate existing docs:

1. Compare every `@example` JSON body against the corresponding TypeScript
   interface — flag any field that is missing or has the wrong type.
2. Warn if a handler has no JSDoc at all.
3. Warn if the JSDoc `@route` does not match the route registered in the Express
   router.
4. Warn if an `*Request` or `*Response` interface was changed but the JSDoc
   `@example` blocks were not updated.

---

## Supporting script

Run the following command to regenerate `docs/openapi.yaml` from source:

```bash
npx ts-node .github/skills/api-docs/generate-api-docs.ts
```

The script reads `src/server/` TypeScript files, extracts JSDoc comments and
TypeScript interfaces, and writes a valid OpenAPI 3.0 document to
`docs/openapi.yaml`.

See `.github/skills/api-docs/generate-api-docs.ts` for implementation details.
