"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Lock, Unlock } from "lucide-react";
import { Code, CodeTabs } from "./Code";
import {
  BASE_URL, exampleFor, resolve, typeLabel,
  type Endpoint, type Schema,
} from "@/lib/openapi";

const KEY = "zen_live_YOUR_KEY";

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** The four samples every endpoint gets, generated from the operation so
 *  they cannot drift from the parameters documented beside them. */
function samples(ep: Endpoint) {
  const authed = ep.op.security === undefined;
  const url = `${BASE_URL}${ep.path.replace(/\{(\w+)\}/g, (_, n) => (n.includes("product") ? "1" : "13"))}`;
  const body = ep.op.requestBody
    ? exampleFor(ep.op.requestBody.content["application/json"]?.schema)
    : null;

  const hdr = authed ? `  -H "Authorization: Bearer ${KEY}" \\\n` : "";
  const idem = ep.method === "POST" ? `  -H "X-Idempotency-Key: order-1042" \\\n` : "";

  const curl = ep.method === "GET"
    ? `curl ${authed ? "\\\n" + hdr.trimEnd().replace(/\\$/, "") + " " : ""}${url}`.replace(/\s+$/, "")
    : `curl -X POST ${url} \\\n${hdr}${idem}  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;

  const pyHeaders = authed ? `headers={"Authorization": f"Bearer {KEY}"}` : "";
  const py = ep.method === "GET"
    ? `import httpx\n\nKEY = "${KEY}"\nr = httpx.get(\n    "${url}",\n    ${pyHeaders},\n)\nr.raise_for_status()\nprint(r.json())`
    : `import httpx, uuid\n\nKEY = "${KEY}"\nr = httpx.post(\n    "${url}",\n    headers={\n        "Authorization": f"Bearer {KEY}",\n        # Always send this. A timeout without it leaves you\n        # unable to tell whether you were charged.\n        "X-Idempotency-Key": str(uuid.uuid4()),\n    },\n    json=${pretty(body).replace(/\n/g, "\n    ")},\n)\nprint(r.json())`;

  const js = ep.method === "GET"
    ? `const res = await fetch("${url}", {\n${authed ? `  headers: { Authorization: \`Bearer \${KEY}\` },\n` : ""}});\nconst data = await res.json();`
    : `const res = await fetch("${url}", {\n  method: "POST",\n  headers: {\n    Authorization: \`Bearer \${KEY}\`,\n    "Content-Type": "application/json",\n    // Always send this — see Retrying safely.\n    "X-Idempotency-Key": crypto.randomUUID(),\n  },\n  body: JSON.stringify(${pretty(body)}),\n});\nconst data = await res.json();`;

  return [
    { label: "cURL", lang: "bash" as const, code: curl },
    { label: "Python", lang: "python" as const, code: py },
    { label: "JavaScript", lang: "js" as const, code: js },
  ];
}

/**
 * The `code` and **bold** the OpenAPI descriptions are written in.
 *
 * The spec is authored as Markdown — it is read by other tools too — so the
 * backticks are real content, not noise to strip. Rendered as elements
 * rather than dangerouslySetInnerHTML: this text comes from a file in the
 * repository today, but a renderer that injects HTML is one content source
 * away from injecting somebody else's.
 */
function inline(text: string): ReactNode[] {
  // Bold is matched first and then RECURSED into, because the spec nests
  // them — "**Always send `X-Idempotency-Key`.**" is one bold run with code
  // inside it, and a flat split leaves the backticks on the page.
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <b key={i}>{inline(part.slice(2, -2))}</b>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="inline">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function EndpointCard({ ep }: { ep: Endpoint }) {
  const authed = ep.op.security === undefined;
  const success = Object.entries(ep.op.responses).find(([c]) => c.startsWith("2"));
  const successSchema = success?.[1].content?.["application/json"]?.schema
    ?? success?.[1].content?.["text/plain"]?.schema;
  const isText = Boolean(success?.[1].content?.["text/plain"]);
  const bodySchema = resolve(ep.op.requestBody?.content["application/json"]?.schema);

  return (
    <section id={ep.op.operationId} style={{ scrollMarginTop: 88, paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className={`verb verb-${ep.method.toLowerCase()}`}>{ep.method}</span>
        <code style={{ fontSize: 15, fontWeight: 500 }}>{ep.path}</code>
        <span title={authed ? "Requires your API key" : "No key required"}
              style={{ color: authed ? "var(--warn)" : "var(--good)", display: "flex" }}>
          {authed ? <Lock size={14} /> : <Unlock size={14} />}
        </span>
      </div>

      <h3 style={{ fontSize: 20, margin: "12px 0 6px", fontWeight: 600 }}>
        {ep.op.summary}
      </h3>
      {ep.op.description && (
        <div className="muted" style={{ margin: "0 0 16px", maxWidth: 680 }}>
          {ep.op.description.split("\n\n").map((para, i) => (
            <p key={i} style={{ margin: "0 0 8px" }}>{inline(para)}</p>
          ))}
        </div>
      )}

      {!!ep.op.parameters?.length && (
        <Block title="Parameters">
          <Params rows={ep.op.parameters} />
        </Block>
      )}

      {bodySchema && (
        <Block title="Body">
          <Props schema={bodySchema} />
        </Block>
      )}

      <Block title="Request">
        <CodeTabs samples={samples(ep)} />
      </Block>

      {successSchema && (
        <Block title={`Response · ${success?.[0]}`}>
          {isText
            ? <Code lang="text">{String(
                success?.[1].content?.["text/plain"]?.example
                ?? "Redeem link: https://example.com/redeem/abc")}</Code>
            : <Code lang="json">{pretty(exampleFor(successSchema))}</Code>}
        </Block>
      )}

      <Block title="Every response">
        <div style={{ display: "grid", gap: 5 }}>
          {Object.entries(ep.op.responses).map(([code, r]) => (
            <div key={code} style={{
              display: "flex", gap: 11, alignItems: "baseline",
              fontSize: 13.8, padding: "5px 0",
              borderBottom: "1px solid var(--line)",
            }}>
              <code className={
                "pill " + (code.startsWith("2") ? "pill-good"
                  : code.startsWith("4") || code.startsWith("5") ? "pill-req" : "pill-warn")
              } style={{ fontFamily: "var(--mono)", flexShrink: 0 }}>{code}</code>
              <span className="muted">{r.description}</span>
            </div>
          ))}
        </div>
      </Block>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: "18px 0" }}>
      <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Params({ rows }: { rows: NonNullable<Endpoint["op"]["parameters"]> }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((p) => (
        <div key={p.name} style={{
          border: "1px solid var(--line)", borderRadius: "var(--radius-sm)",
          padding: "11px 13px", background: "var(--surface)",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <code style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</code>
            <span className="faint" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
              {typeLabel(p.schema)}
            </span>
            <span className="pill">{p.in}</span>
            {p.required && <span className="pill pill-req">required</span>}
          </div>
          {p.description && (
            <p className="muted" style={{ margin: "6px 0 0", fontSize: 13.6 }}>{p.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function Props({ schema }: { schema: Schema }) {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {Object.entries(props).map(([name, raw]) => {
        const field = raw.$ref ? raw : raw;
        return (
          <div key={name} style={{
            border: "1px solid var(--line)", borderRadius: "var(--radius-sm)",
            padding: "11px 13px", background: "var(--surface)",
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ fontWeight: 600, fontSize: 13.5 }}>{name}</code>
              <span className="faint" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                {typeLabel(field)}
              </span>
              {required.has(name) && <span className="pill pill-req">required</span>}
              {field.enum && (
                <span className="faint" style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>
                  {field.enum.join(" · ")}
                </span>
              )}
            </div>
            {field.description && (
              <p className="muted" style={{ margin: "6px 0 0", fontSize: 13.6, lineHeight: 1.55 }}>
                {field.description}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SchemaCard({ name, schema }: { name: string; schema: Schema }) {
  const [open, setOpen] = useState(name === "Order" || name === "Product");
  return (
    <div id={`schema-${name}`} style={{
      border: "1px solid var(--line)", borderRadius: "var(--radius)",
      background: "var(--surface)", overflow: "hidden", scrollMarginTop: 88,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, padding: "13px 16px", background: "none", border: "none",
        color: "var(--ink)", font: "inherit", cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 14 }}>{name}</span>
        <ChevronDown size={16} style={{
          color: "var(--accent)", transform: open ? "rotate(180deg)" : "none",
          transition: "transform .2s ease", flexShrink: 0,
        }} />
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {schema.description && (
            <p className="muted" style={{ margin: "0 0 12px", fontSize: 14 }}>{schema.description}</p>
          )}
          <Props schema={schema} />
        </div>
      )}
    </div>
  );
}
