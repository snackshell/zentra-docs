"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

/**
 * A code block with a copy button and just enough highlighting.
 *
 * Hand-rolled rather than a highlighter dependency: the only languages here
 * are shell, JSON, Python and JavaScript, and a tokeniser that handles those
 * four is a page of regex against 300kB of library. It also keeps the colours
 * on the palette's own tokens instead of a theme that arrives with its own.
 */

type Lang = "bash" | "json" | "python" | "js" | "text";

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * ONE pass, never two.
 *
 * The first version ran a regex for comments, then another for strings —
 * and the second happily matched the quotes inside `class="tok-cmt"` that
 * the first had just inserted, printing raw markup on the page. Any
 * highlighter that rewrites its own output has that bug latent in it.
 *
 * So: escape once, then match every token kind in a SINGLE alternation and
 * emit each match once. Nothing this produces is ever scanned again. Order
 * inside the alternation is the precedence — comment before string before
 * word, because a # inside a string is not a comment and a keyword inside
 * one is not a keyword.
 *
 * Note the patterns match ESCAPED text: by this point a double quote is
 * already `&quot;`, which is why they look the way they do.
 */

const QUOTED = String.raw`&quot;(?:(?!&quot;).)*&quot;|&#39;(?:(?!&#39;).)*&#39;|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'`;

const KEYWORDS: Record<"bash" | "python" | "js", RegExp> = {
  bash: /^(?:then|fi|if|else|do|done|export)$/,
  python: /^(?:import|from|def|return|if|else|raise|with|as|for|in|None|True|False)$/,
  js: /^(?:const|let|await|async|function|return|if|else|throw|new|for|of|true|false|null)$/,
};

const BUILTINS: Record<"bash" | "python" | "js", RegExp> = {
  bash: /^(?:curl|echo|cat|grep|printf)$/,
  python: /^(?:print|httpx|requests|uuid)$/,
  js: /^(?:fetch|JSON|crypto|console)$/,
};

function highlight(source: string, lang: Lang): string {
  const text = escape(source);
  if (lang === "text") return text;

  if (lang === "json") {
    const re = new RegExp(
      `(${QUOTED})(\\s*:)?|\\b(-?\\d+(?:\\.\\d+)?)\\b|\\b(true|false|null)\\b`,
      "g",
    );
    return text.replace(re, (_m, str, colon, num, lit) => {
      if (str) {
        return colon
          ? `<span class="tok-key">${str}</span><span class="tok-punc">${colon}</span>`
          : `<span class="tok-str">${str}</span>`;
      }
      if (num) return `<span class="tok-num">${num}</span>`;
      return `<span class="tok-num">${lit}</span>`;
    });
  }

  const words = KEYWORDS[lang];
  const builtins = BUILTINS[lang];
  const re = new RegExp(
    `(#[^\\n]*)|(${QUOTED})|(-{1,2}[A-Za-z][A-Za-z-]*)|([A-Za-z_][A-Za-z0-9_]*)`,
    "g",
  );

  return text.replace(re, (m, cmt, str, flag, word) => {
    if (cmt) return `<span class="tok-cmt">${cmt}</span>`;
    if (str) return `<span class="tok-str">${str}</span>`;
    if (flag) return lang === "bash" ? `<span class="tok-key">${flag}</span>` : m;
    if (word) {
      if (words.test(word)) return `<span class="tok-key">${word}</span>`;
      if (builtins.test(word)) return `<span class="tok-fn">${word}</span>`;
    }
    return m;
  });
}

export function Code({ children, lang = "bash", label }: {
  children: string; lang?: Lang; label?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // A clipboard a browser refuses (no permission, insecure context) is
      // not worth an error dialog — the code is on screen and selectable.
    }
  }

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div className="faint" style={{
          fontSize: 11.5, fontFamily: "var(--mono)", marginBottom: 6,
          letterSpacing: ".04em", textTransform: "uppercase",
        }}>{label}</div>
      )}
      <button
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        style={{
          position: "absolute", top: label ? 28 : 8, right: 8, zIndex: 2,
          display: "grid", placeItems: "center", width: 30, height: 30,
          border: "1px solid var(--line-strong)", borderRadius: 7,
          background: "var(--ground)", color: copied ? "var(--good)" : "var(--ink-faint)",
          cursor: "pointer",
        }}
      >
        {copied ? <Check size={14} strokeWidth={2.4} /> : <Copy size={14} strokeWidth={2} />}
      </button>
      <pre className="code">
        <code dangerouslySetInnerHTML={{ __html: highlight(children, lang) }} />
      </pre>
    </div>
  );
}

export function CodeTabs({ samples }: {
  samples: { label: string; lang: Lang; code: string }[];
}) {
  const [active, setActive] = useState(0);
  const current = samples[active];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
        {samples.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            style={{
              border: "1px solid " + (i === active ? "var(--accent)" : "var(--line)"),
              background: i === active ? "var(--accent-soft)" : "transparent",
              color: i === active ? "var(--accent-ink)" : "var(--ink-faint)",
              borderRadius: 7, padding: "5px 11px", fontSize: 12.5,
              fontFamily: "var(--mono)", cursor: "pointer",
            }}
          >{s.label}</button>
        ))}
      </div>
      <Code lang={current.lang}>{current.code}</Code>
    </div>
  );
}
