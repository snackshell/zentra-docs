import raw from "./openapi.json";

/**
 * The OpenAPI document, read at build time.
 *
 * Imported rather than fetched, deliberately: the reference then cannot
 * render a page that says one thing while the API does another because a
 * request failed. It is the same file the bot repository publishes, and a
 * test there compares it against the live router on every run.
 */

export type Schema = {
  type?: string | string[];
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: string[];
  example?: unknown;
  default?: unknown;
  format?: string;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  $ref?: string;
};

export type Operation = {
  tags?: string[];
  operationId: string;
  summary?: string;
  description?: string;
  security?: unknown[];
  parameters?: {
    name: string; in: string; required?: boolean;
    description?: string; schema?: Schema;
  }[];
  requestBody?: {
    required?: boolean;
    content: Record<string, { schema: Schema }>;
  };
  responses: Record<string, {
    description: string;
    content?: Record<string, { schema?: Schema; example?: unknown }>;
  }>;
};

export type Spec = {
  openapi: string;
  info: { title: string; version: string; summary?: string; description?: string };
  servers: { url: string; description?: string }[];
  tags?: { name: string; description?: string }[];
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, Schema>; securitySchemes: Record<string, Schema> };
};

export const spec = raw as unknown as Spec;

export const BASE_URL = spec.servers[0]?.url ?? "https://api.zentradigital.shop";

export type Endpoint = { method: string; path: string; op: Operation };

/** Every operation, flattened, in the order the document declares them —
 *  which is the order a reader should meet them, not alphabetical. */
export function endpoints(): Endpoint[] {
  const out: Endpoint[] = [];
  for (const [path, ops] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(ops)) {
      out.push({ method: method.toUpperCase(), path, op });
    }
  }
  return out;
}

/** Resolve a $ref against components.schemas. One level is all this
 *  document uses, and pretending to handle arbitrary JSON Pointers would be
 *  code with no caller. */
export function resolve(schema: Schema | undefined): Schema | undefined {
  if (!schema) return undefined;
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop();
    return name ? spec.components.schemas[name] : undefined;
  }
  return schema;
}

export function typeLabel(schema: Schema | undefined): string {
  if (!schema) return "";
  if (schema.$ref) return schema.$ref.split("/").pop() ?? "object";
  const t = schema.type;
  const base = Array.isArray(t) ? t.filter((x) => x !== "null").join(" | ") : t ?? "object";
  const nullable = Array.isArray(t) && t.includes("null");
  if (base === "array" && schema.items) return `${typeLabel(schema.items)}[]`;
  return nullable ? `${base} | null` : base;
}

/** A worked example generated FROM the schema, so it cannot drift from the
 *  types beside it the way a hand-written sample does. */
export function exampleFor(schema: Schema | undefined, depth = 0): unknown {
  const s = resolve(schema);
  if (!s || depth > 4) return null;
  if (s.example !== undefined) return s.example;
  if (s.enum?.length) return s.enum[0];

  const t = Array.isArray(s.type) ? s.type.find((x) => x !== "null") : s.type;
  if (t === "array") return [exampleFor(s.items, depth + 1)];
  if (t === "object" || s.properties) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(s.properties ?? {})) {
      out[k] = exampleFor(v, depth + 1);
    }
    return out;
  }
  if (t === "integer" || t === "number") return s.default ?? 1;
  if (t === "boolean") return true;
  if (s.format === "date-time") return "2026-08-26T19:48:52Z";
  return s.description?.slice(0, 0) ?? "string";
}
