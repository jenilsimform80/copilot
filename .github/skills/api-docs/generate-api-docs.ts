#!/usr/bin/env ts-node
/**
 * generate-api-docs.ts
 *
 * Scans src/server/ TypeScript files, extracts JSDoc @route annotations and
 * TypeScript interface definitions, and writes an OpenAPI 3.0 YAML document to
 * docs/openapi.yaml.
 *
 * Usage:
 *   npx ts-node .github/skills/api-docs/generate-api-docs.ts
 *
 * The script is intentionally dependency-light: it uses only the Node.js
 * standard library and the TypeScript compiler API that is already installed as
 * a devDependency.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RouteEntry {
  /** HTTP method in upper-case, e.g. "POST" */
  method: string;
  /** Path template, e.g. "/api/users" */
  routePath: string;
  /** camelCase operation id derived from the function name */
  operationId: string;
  /** First line of the JSDoc summary */
  summary: string;
  /** Raw JSDoc text of the first @example block labelled "Request body" */
  requestExample: string;
  /** Raw JSDoc text of the first @example block labelled "Success response" */
  successExample: string;
  /** HTTP status code for the success response, e.g. 201 */
  successStatus: number;
}

interface InterfaceField {
  name: string;
  typeText: string;
  optional: boolean;
}

interface ParsedInterface {
  name: string;
  fields: InterfaceField[];
}

// ---------------------------------------------------------------------------
// JSDoc parsing helpers
// ---------------------------------------------------------------------------

/** Extract all JSDoc tags from a node's leading comments. */
function getJsDocComment(node: ts.Node, sourceFile: ts.SourceFile): string {
  const fullText = sourceFile.getFullText();
  const ranges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
  if (!ranges) return '';
  return ranges
    .filter((r) => fullText.slice(r.pos, r.pos + 3) === '/**')
    .map((r) => fullText.slice(r.pos, r.end))
    .join('\n');
}

/** Pull the value of a specific JSDoc tag line, e.g. "@route POST /api/users" */
function extractTag(jsDoc: string, tag: string): string {
  const regex = new RegExp(`@${tag}\\s+(.+)`);
  const match = jsDoc.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Extract the route from a JSDoc block.
 * Supports two styles:
 *   1. @route POST /api/users          (preferred, explicit tag)
 *   2. POST /api/users on the first content line (legacy style)
 */
function extractRoute(jsDoc: string): string {
  // Try explicit @route tag first
  const tagged = extractTag(jsDoc, 'route');
  if (tagged) return tagged;

  // Fall back to "METHOD /path" on the first non-empty comment line
  const HTTP_METHODS = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\/\S*)/;
  for (const raw of jsDoc.split('\n')) {
    const line = raw.replace(/^\s*\*\s?/, '').trim();
    const m = line.match(HTTP_METHODS);
    if (m) return `${m[1]} ${m[2]}`;
  }
  return '';
}

/** Extract the text of a @example block by its label, e.g. "Request body". */
function extractExample(jsDoc: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`@example\\s+${escapedLabel}[^:]*:\\s*\\n([\\s\\S]*?)(?=\\s*\\*\\s*@|\\s*\\*\\/)`);
  const match = jsDoc.match(regex);
  if (!match) return '';
  // Strip leading " * " from each line
  return match[1]
    .split('\n')
    .map((l) => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();
}

/** Derive a camelCase operationId from a handler function name. */
function toOperationId(fnName: string): string {
  return fnName.replace(/Handler$/, '');
}

/** Capitalise the first letter of a string. */
function upperFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Derive probable request/response schema names from an operationId and the
 * set of known schemas.  Returns null when no matching schema is found.
 *
 * Convention:
 *   operationId  = "createUser"
 *   entity       = "User"   (last sequence of uppercase-starting chars)
 *   requestName  = "CreateUserRequest"
 *   responseName = "UserResponse"
 */
function deriveSchemaNames(
  operationId: string,
  knownSchemas: Record<string, unknown>,
): { requestSchema: string | null; responseSchema: string | null } {
  // Extract entity: last capitalised word in the operationId
  const words = operationId.split(/(?=[A-Z])/);
  const entity = words[words.length - 1];

  const requestCandidate = `${upperFirst(operationId)}Request`;
  const responseCandidate = `${entity}Response`;

  return {
    requestSchema: requestCandidate in knownSchemas ? requestCandidate : null,
    responseSchema: responseCandidate in knownSchemas ? responseCandidate : null,
  };
}

/** Extract the HTTP status code from a success example label like "Success response (201)". */
function parseSuccessStatus(jsDoc: string): number {
  const match = jsDoc.match(/@example\s+Success response\s*\((\d{3})\)/);
  return match ? parseInt(match[1], 10) : 200;
}

// ---------------------------------------------------------------------------
// TypeScript AST helpers
// ---------------------------------------------------------------------------

/** Collect all exported interface declarations from a source file. */
function collectInterfaces(sourceFile: ts.SourceFile): ParsedInterface[] {
  const interfaces: ParsedInterface[] = [];

  function visit(node: ts.Node): void {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const fields: InterfaceField[] = node.members
        .filter(ts.isPropertySignature)
        .map((prop) => ({
          name: (prop.name as ts.Identifier).text,
          typeText: prop.type ? prop.type.getText(sourceFile) : 'unknown',
          optional: prop.questionToken !== undefined,
        }));
      interfaces.push({ name: node.name.text, fields });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return interfaces;
}

/** Collect route handlers (exported async functions with JSDoc @route). */
function collectRouteEntries(sourceFile: ts.SourceFile): RouteEntry[] {
  const entries: RouteEntry[] = [];

  function visit(node: ts.Node): void {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const jsDoc = getJsDocComment(node, sourceFile);
      const route = extractRoute(jsDoc);
      if (!route) {
        ts.forEachChild(node, visit);
        return;
      }

      const [method, ...pathParts] = route.split(/\s+/);
      const routePath = pathParts.join(' ');
      const HTTP_PREFIX = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\/\S*/;
      const summaryLine = jsDoc
        .split('\n')
        .map((l) => l.replace(/^\s*\*\s?/, ''))
        .filter((l) => l && !l.startsWith('@') && !l.startsWith('/*') && !l.startsWith('*/') && !HTTP_PREFIX.test(l))[0] ?? '';

      entries.push({
        method: method.toUpperCase(),
        routePath,
        operationId: toOperationId(node.name.text),
        summary: summaryLine.trim(),
        requestExample: extractExample(jsDoc, 'Request body'),
        successExample: extractExample(jsDoc, 'Success response'),
        successStatus: parseSuccessStatus(jsDoc),
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return entries;
}

// ---------------------------------------------------------------------------
// OpenAPI schema generation
// ---------------------------------------------------------------------------

/** Convert a TypeScript type string to an OpenAPI type object (best-effort). */
function tsTypeToOpenApi(typeText: string): Record<string, unknown> {
  const t = typeText.trim();

  // Union of string literals → enum
  if (t.includes('|') && t.includes("'")) {
    const values = t.split('|').map((v) => v.trim().replace(/'/g, ''));
    return { type: 'string', enum: values };
  }

  const primitiveMap: Record<string, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    Date: 'string',
    unknown: 'object',
  };

  if (primitiveMap[t]) {
    const result: Record<string, unknown> = { type: primitiveMap[t] };
    if (t === 'Date') result['format'] = 'date-time';
    return result;
  }

  return { type: 'object' };
}

/** Build an OpenAPI schema object from a parsed interface. */
function interfaceToSchema(iface: ParsedInterface): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of iface.fields) {
    properties[field.name] = tsTypeToOpenApi(field.typeText);
    if (!field.optional) {
      required.push(field.name);
    }
  }

  const schema: Record<string, unknown> = { type: 'object', properties };
  if (required.length > 0) schema['required'] = required;
  return schema;
}

// ---------------------------------------------------------------------------
// YAML serialiser (dependency-free, handles the subset we produce)
// ---------------------------------------------------------------------------

function toYaml(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    // Quote strings that contain special YAML characters
    if (/[:{}\[\],#&*!|>'"%@`]/.test(obj) || obj.includes('\n') || obj === '') {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj.map((item) => `${pad}- ${toYaml(item, indent + 1).trimStart()}`).join('\n');
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return '\n' + entries
      .map(([k, v]) => {
        const valueYaml = toYaml(v, indent + 1);
        if (valueYaml.startsWith('\n')) {
          return `${pad}${k}:${valueYaml}`;
        }
        return `${pad}${k}: ${valueYaml}`;
      })
      .join('\n');
  }
  return String(obj);
}

/** Serialise a top-level mapping to YAML. */
function serializeYaml(doc: Record<string, unknown>): string {
  return Object.entries(doc)
    .map(([k, v]) => {
      const valueYaml = toYaml(v, 1);
      if (valueYaml.startsWith('\n')) {
        return `${k}:${valueYaml}`;
      }
      return `${k}: ${valueYaml}`;
    })
    .join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const repoRoot = path.resolve(__dirname, '../../..');
  const serverDir = path.join(repoRoot, 'src', 'server');
  const outFile = path.join(repoRoot, 'docs', 'openapi.yaml');

  // Collect TypeScript source files
  const tsFiles = fs
    .readdirSync(serverDir)
    .filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'))
    .map((f) => path.join(serverDir, f));

  const allRoutes: RouteEntry[] = [];
  const allInterfaces: ParsedInterface[] = [];

  for (const filePath of tsFiles) {
    const sourceText = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceText,
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
    );
    allRoutes.push(...collectRouteEntries(sourceFile));
    allInterfaces.push(...collectInterfaces(sourceFile));
  }

  // Build component schemas
  const schemas: Record<string, unknown> = {};
  for (const iface of allInterfaces) {
    schemas[iface.name] = interfaceToSchema(iface);
  }

  // Standard error schemas
  schemas['ValidationError'] = {
    type: 'object',
    properties: {
      field: { type: 'string' },
      message: { type: 'string' },
      value: {},
    },
    required: ['field', 'message'],
  };
  schemas['ApiError'] = {
    type: 'object',
    properties: {
      status: { type: 'number' },
      message: { type: 'string' },
      details: { type: 'array', items: { '$ref': '#/components/schemas/ValidationError' } },
    },
    required: ['status', 'message'],
  };

  // Build paths
  const paths: Record<string, unknown> = {};
  for (const route of allRoutes) {
    const pathKey = route.routePath || '/';
    if (!paths[pathKey]) paths[pathKey] = {};
    const methodKey = route.method.toLowerCase();

    const { requestSchema, responseSchema } = deriveSchemaNames(route.operationId, schemas);

    const successContent = responseSchema
      ? { 'application/json': { schema: { '$ref': `#/components/schemas/${responseSchema}` } } }
      : { 'application/json': { schema: { type: 'object' } } };

    const responses: Record<string, unknown> = {
      [String(route.successStatus)]: {
        description: 'Success',
        content: successContent,
      },
      '400': {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { '$ref': '#/components/schemas/ApiError' },
          },
        },
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { '$ref': '#/components/schemas/ApiError' },
          },
        },
      },
    };

    const requestBodySchema = requestSchema
      ? { '$ref': `#/components/schemas/${requestSchema}` }
      : { type: 'object' };

    (paths[pathKey] as Record<string, unknown>)[methodKey] = {
      operationId: route.operationId,
      summary: route.summary,
      requestBody:
        route.requestExample
          ? {
              required: true,
              content: {
                'application/json': {
                  schema: requestBodySchema,
                  example: route.requestExample,
                },
              },
            }
          : undefined,
      responses,
    };
  }

  // Assemble the OpenAPI document
  const openApiDoc: Record<string, unknown> = {
    openapi: '3.0.3',
    info: {
      title: 'copilot-test API',
      version: '1.0.0',
      description: 'Auto-generated from src/server/ by .github/skills/api-docs/generate-api-docs.ts',
    },
    paths,
    components: { schemas },
  };

  // Write output
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, serializeYaml(openApiDoc));
  console.log(`OpenAPI document written to ${path.relative(repoRoot, outFile)}`);
  console.log(`  Routes documented: ${allRoutes.length}`);
  console.log(`  Schemas generated: ${Object.keys(schemas).length}`);
}

main();
