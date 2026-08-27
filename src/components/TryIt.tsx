"use client";

import { useEffect, useState } from "react";
import { Play, KeyRound, Eye, EyeOff, Trash2, ShieldAlert } from "lucide-react";
import { BASE_URL, type Endpoint } from "@/lib/openapi";

/**
 * Run a request against the live API, with the reader's own key.
 *
 * READING ENDPOINTS ONLY, and that is enforced by the server rather than by
 * this file: the API's CORS allowlist grants this origin GET and OPTIONS, so
 * a POST from any page here is refused at the preflight whatever the page
 * asks for. POST /v1/orders spends real money out of a real wallet, and a
 * console that can charge somebody while they read the documentation is a
 * console that eventually will. That endpoint keeps its copyable samples.
 *
 * THE KEY NEVER LEAVES THE BROWSER. It is held in sessionStorage — gone when
 * the tab closes — and sent only to the API host in an Authorization header.
 * There is no server on this site to send it to: these pages are static.
 */

const STORAGE_KEY = "zentra.api.key";

/** One key for the whole page. Each card renders its own controls, and a key
 *  pasted into one has to be there in all of them — retyping it per endpoint
 *  is how somebody ends up pasting it into the wrong box. */
function useApiKey(): [string, (value: string) => void] {
  const [key, setKey] = useState("");

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem(STORAGE_KEY) ?? "");
    } catch {
      // A browser that refuses storage still gets a working console; the
      // key just does not survive a reload.
    }
    const onChange = (e: Event) => setKey((e as CustomEvent<string>).detail);
    window.addEventListener("zentra-key", onChange);
    return () => window.removeEventListener("zentra-key", onChange);
  }, []);

  function update(value: string) {
    setKey(value);
    try {
      if (value) sessionStorage.setItem(STORAGE_KEY, value);
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Same again: not being able to remember it is not a reason to refuse
      // to use it.
    }
    window.dispatchEvent(new CustomEvent("zentra-key", { detail: value }));
  }

  return [key, update];
}

export function KeyBar() {
  const [key, setKey] = useApiKey();
  const [shown, setShown] = useState(false);
  const looksRight = key === "" || /^zen_live_[A-Za-z0-9]{20,}$/.test(key);

  return (
    <div style={{
      border: "1px solid var(--line-strong)", borderRadius: "var(--radius)",
      background: "var(--surface)", padding: "14px 16px", margin: "10px 0 26px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <KeyRound size={15} strokeWidth={2} style={{ color: "var(--accent)" }} />
        <strong style={{ fontSize: 14 }}>Your API key</strong>
        <span className="pill">optional</span>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        <input
          type={shown ? "text" : "password"}
          value={key}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setKey(e.target.value.trim())}
          placeholder="zen_live_…"
          aria-label="Your Zentra API key"
          style={{
            flex: "1 1 260px", minWidth: 0,
            fontFamily: "var(--mono)", fontSize: 13,
            padding: "9px 11px", borderRadius: "var(--radius-sm)",
            border: `1px solid ${looksRight ? "var(--line-strong)" : "var(--bad)"}`,
            background: "var(--ground)", color: "var(--ink)",
          }}
        />
        <button onClick={() => setShown((s) => !s)} className="ghost-btn"
                aria-label={shown ? "Hide key" : "Show key"}>
          {shown ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button onClick={() => setKey("")} className="ghost-btn" aria-label="Forget key">
          <Trash2 size={15} />
        </button>
      </div>

      <p className="faint" style={{ fontSize: 12.5, margin: "9px 0 0", lineHeight: 1.55 }}>
        {looksRight ? (
          <>
            Kept in this tab only — it is gone when you close it, and these pages
            are static, so there is no server here to send it to. Requests go
            straight from your browser to <code className="inline">{new URL(BASE_URL).host}</code>.
            Get one from the bot: <b>Menu → API Link</b>.
          </>
        ) : (
          <>That does not look like a Zentra key. They start{" "}
            <code className="inline">zen_live_</code> and are 49 characters long.</>
        )}
      </p>
    </div>
  );
}

type Result =
  | { state: "idle" }
  | { state: "running" }
  | { state: "done"; status: number; ms: number; body: string }
  | { state: "failed"; message: string };

export function TryIt({ ep }: { ep: Endpoint }) {
  const [key] = useApiKey();
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>({ state: "idle" });

  // POST is not offered, and the API would refuse it from here anyway.
  if (ep.method !== "GET") {
    return (
      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        border: "1px solid var(--warn)", background: "var(--warn-soft)",
        borderRadius: "var(--radius-sm)", padding: "12px 14px",
      }}>
        <ShieldAlert size={16} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
        <p className="muted" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
          <b style={{ color: "var(--ink)" }}>This one is not runnable from the docs.</b>{" "}
          It spends real money from your wallet, so the API refuses it from a
          browser on this site — the preflight allows only reads. Copy a sample
          above and run it from your own code, where a charge is something you
          meant.
        </p>
      </div>
    );
  }

  const params = ep.op.parameters ?? [];
  const missing = params.filter((p) => p.required && !values[p.name]?.trim());
  const ready = key !== "" && missing.length === 0;

  async function run() {
    let path = ep.path;
    const query = new URLSearchParams();
    for (const p of params) {
      const value = values[p.name]?.trim();
      if (!value) continue;
      if (p.in === "path") path = path.replace(`{${p.name}}`, encodeURIComponent(value));
      else query.set(p.name, value);
    }

    const url = `${BASE_URL}${path}${query.toString() ? `?${query}` : ""}`;
    const started = performance.now();
    setResult({ state: "running" });

    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
      const text = await res.text();
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // /export answers text/plain, and that is the response, not a fault.
      }
      setResult({
        state: "done", status: res.status, body,
        ms: Math.round(performance.now() - started),
      });
    } catch {
      // fetch() rejects for a network failure and for a blocked CORS
      // response alike, and the browser deliberately does not say which.
      setResult({
        state: "failed",
        message:
          "The request did not complete. Either the API is unreachable from " +
          "here, or your browser blocked the response. Your key was not sent " +
          "anywhere else — try the cURL sample above to see the real error.",
      });
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {params.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          {params.map((p) => (
            <label key={p.name} style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 12.5, fontFamily: "var(--mono)" }}>
                {p.name}
                {p.required && <span style={{ color: "var(--bad)" }}> *</span>}
                <span className="faint" style={{ marginLeft: 7 }}>{p.in}</span>
              </span>
              <input
                value={values[p.name] ?? ""}
                spellCheck={false}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [p.name]: e.target.value }))}
                placeholder={p.in === "path" ? "13" : ""}
                style={{
                  fontFamily: "var(--mono)", fontSize: 13, padding: "8px 10px",
                  borderRadius: "var(--radius-sm)", border: "1px solid var(--line-strong)",
                  background: "var(--ground)", color: "var(--ink)",
                }}
              />
            </label>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={run}
          disabled={!ready || result.state === "running"}
          className="run-btn"
        >
          <Play size={14} strokeWidth={2.4} />
          {result.state === "running" ? "Sending…" : "Send request"}
        </button>
        {!ready && (
          <span className="faint" style={{ fontSize: 12.5 }}>
            {key === ""
              ? "Paste your key above to run this."
              : `Fill in ${missing.map((p) => p.name).join(", ")}.`}
          </span>
        )}
      </div>

      {result.state === "failed" && (
        <p className="muted" style={{ fontSize: 13.3, margin: 0, lineHeight: 1.6 }}>
          {result.message}
        </p>
      )}

      {result.state === "done" && (
        <div>
          <div style={{
            display: "flex", gap: 9, alignItems: "center", marginBottom: 7,
            fontSize: 12.5, fontFamily: "var(--mono)",
          }}>
            <code className={
              "pill " + (result.status < 300 ? "pill-good" : "pill-req")
            }>{result.status}</code>
            <span className="faint">{result.ms} ms</span>
          </div>
          <pre className="code" style={{ maxHeight: 340, overflow: "auto" }}>
            <code>{result.body}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
