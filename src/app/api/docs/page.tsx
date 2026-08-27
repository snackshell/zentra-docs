import type { Metadata } from "next";
import { AlertTriangle, KeyRound, RefreshCw, Coins, Bug } from "lucide-react";
import { Footer, Nav, BOT_URL } from "@/components/Nav";
import { Code } from "@/components/Code";
import { EndpointCard, SchemaCard } from "@/components/Reference";
import { KeyBar } from "@/components/TryIt";
import { BASE_URL, endpoints, spec } from "@/lib/openapi";

export const metadata: Metadata = {
  title: "Reseller API",
  description:
    "Sell Zentra's catalogue from your own bot or site. Orders are paid from " +
    "your Zentra wallet at shop prices and delivered instantly.",
};

const QUICKSTART = `# 1. Check your key and balance
curl https://api.zentradigital.shop/v1/me \\
  -H "Authorization: Bearer zen_live_YOUR_KEY"

# 2. See what is for sale (no key needed)
curl https://api.zentradigital.shop/v1/products

# 3. Buy something
curl -X POST https://api.zentradigital.shop/v1/orders \\
  -H "Authorization: Bearer zen_live_YOUR_KEY" \\
  -H "X-Idempotency-Key: my-first-order" \\
  -H "Content-Type: application/json" \\
  -d '{"product_id": 1, "quantity": 1}'`;

const ERROR_SHAPE = `{
  "error": {
    "code": "insufficient_stock",
    "message": "Only 3 code(s) of Gemini AI Pro 18m are left."
  }
}`;

const CODES: [string, string, string][] = [
  ["unauthorized", "401", "No key, a malformed key, or one that is no longer live."],
  ["account_suspended", "403", "The account behind this key is suspended."],
  ["api_disabled", "503", "The reseller API is closed right now."],
  ["invalid_request", "400", "Malformed body, or a quantity outside 1–1000."],
  ["order_failed", "402", "Your wallet cannot cover it, or the supplier refused and you were refunded."],
  ["out_of_stock", "409", "Nothing left of that product."],
  ["insufficient_stock", "409", "Fewer units left than you asked for."],
  ["not_available", "409", "The supplier has withdrawn it for now."],
  ["in_progress", "409", "An identical idempotency key is still being placed."],
  ["not_found", "404", "No such product or order — or the order is not yours."],
  ["not_delivered", "409", "That order has nothing to export yet."],
  ["rate_limited", "429", "Too many requests this minute."],
  ["daily_cap_reached", "429", "This key's daily spend cap is used up."],
  ["unresolved", "202", "The supplier call died in transit. You were debited and a person is reconciling it — do not retry."],
];

export default function Docs() {
  const eps = endpoints().filter((e) => e.path !== "/health");
  const schemas = Object.entries(spec.components.schemas);

  return (
    <>
      <Nav />
      <div className="wrap" style={{ display: "flex", gap: 44, alignItems: "flex-start" }}>

        {/* ---- sidebar ------------------------------------------------- */}
        <aside style={{
          position: "sticky", top: 62, flexShrink: 0, width: 214,
          maxHeight: "calc(100vh - 62px)", overflowY: "auto",
          padding: "30px 0 40px", fontSize: 14,
        }} className="docs-side">
          <SideGroup title="Guide" items={[
            ["Quickstart", "#quickstart"],
            ["Authentication", "#auth"],
            ["Money", "#money"],
            ["Retrying safely", "#idempotency"],
            ["Errors", "#errors"],
            ["Limits", "#limits"],
          ]} />
          {/* {product_id} and {order_id} are shortened to {id} here only —
              the full names stay on the endpoint itself. A sidebar label
              that ellipsises mid-word tells a reader less than a short one. */}
          <SideGroup title="Endpoints" items={eps.map((e) => [
            `${e.method} ${e.path.replace("/v1", "").replace(/\{\w+_id\}/g, "{id}")}`,
            `#${e.op.operationId}`,
          ])} mono />
          <SideGroup title="Schemas" items={schemas.map(([n]) => [n, `#schema-${n}`])} mono />
        </aside>

        {/* ---- content ------------------------------------------------- */}
        <main style={{ flex: 1, minWidth: 0, padding: "38px 0 20px" }}>
          <span className="eyebrow">Version {spec.info.version}</span>
          <h1 style={{
            fontFamily: "var(--display)", fontWeight: 400, fontSize: 44,
            letterSpacing: "-.02em", margin: "10px 0 10px",
          }}>Reseller API</h1>
          <p className="muted" style={{ fontSize: 17, margin: "0 0 6px", maxWidth: 640 }}>
            {spec.info.summary}
          </p>
          <p className="muted" style={{ margin: "0 0 22px", maxWidth: 640 }}>
            Orders are paid from your Zentra wallet at shop prices and delivered
            instantly — the same way a purchase in the Telegram bot is. You resell
            at whatever price you choose.
          </p>
          <Code lang="text" label="Base URL">{BASE_URL}</Code>

          {/* Quickstart */}
          <H id="quickstart">Quickstart</H>
          <ol className="muted" style={{ paddingLeft: 20, margin: "0 0 16px", maxWidth: 640 }}>
            <li>Open <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}>@ZentraShopBot</a> in Telegram.</li>
            <li>Top up your wallet — Telebirr, Bank of Abyssinia, USDT or Binance Pay.</li>
            <li>Tap <b>API Link → Create API key</b>. It is shown once.</li>
            <li>Send it on every request as a bearer token.</li>
          </ol>
          <Code lang="bash">{QUICKSTART}</Code>

          {/* Auth */}
          <H id="auth">Authentication</H>
          <Note icon={<KeyRound size={17} />}>
            Your key is shown <b>exactly once</b>, when you create it. Only a
            fingerprint is stored, so it can never be recovered — only replaced.
            Regenerating immediately kills the previous key.
          </Note>
          <p className="muted" style={{ maxWidth: 640 }}>
            Every authenticated request carries the key as a bearer token. Anyone
            holding it can spend your wallet, so keep it server-side — never in a
            page you ship, a mobile app, or a public repository.
          </p>
          {/* The console below IS a browser, so the line above has to say what
              makes that different rather than leave the reader to notice the
              contradiction and trust neither statement. */}
          <p className="muted" style={{ maxWidth: 640 }}>
            The <b>Try it</b> boxes further down are the exception, and a narrow
            one. Your key stays in this tab, is never sent anywhere but the API,
            and the API only accepts <b>reads</b> from this site — placing an
            order from a page here is refused by the server, not merely left out
            of the interface.
          </p>
          <Code lang="bash">{`-H "Authorization: Bearer zen_live_YOUR_KEY"`}</Code>

          {/* Money */}
          <H id="money">Money</H>
          <Note icon={<Coins size={17} />} tone="warn">
            Every amount is a <b>string</b>, in USDT. Parse it with a decimal
            type — <code className="inline">BigDecimal</code>,{" "}
            <code className="inline">decimal.Decimal</code>, or a decimal library.
            Reading <code className="inline">&quot;0.90&quot;</code> as a float and
            summing it is how two systems come to disagree about what was charged.
          </Note>
          <p className="muted" style={{ maxWidth: 640 }}>
            JSON&apos;s only numeric type is a binary float, which cannot represent
            most decimal fractions exactly. Amounts are therefore sent as strings
            so the digits you read are the digits we charged.
          </p>

          {/* Idempotency */}
          <H id="idempotency">Retrying safely</H>
          <Note icon={<RefreshCw size={17} />}>
            Always send <code className="inline">X-Idempotency-Key</code> on{" "}
            <code className="inline">POST /v1/orders</code>. Without it, a retry
            after a timeout is a second order and a second charge.
          </Note>
          <p className="muted" style={{ maxWidth: 640 }}>
            Pick a value unique to the order you intend to place — a UUID, or your
            own order id. Retrying with the same value returns the{" "}
            <b>original order</b> with HTTP 200 and does not charge you again. If
            the first request is still in flight, you get{" "}
            <code className="inline">409 in_progress</code> — wait and ask again.
          </p>
          <p className="muted" style={{ maxWidth: 640 }}>
            A key whose order never happened is released, so you can retry with it
            once the problem is fixed.
          </p>

          {/* Errors */}
          <H id="errors">Errors</H>
          <p className="muted" style={{ maxWidth: 640 }}>
            Every failure has the same shape. Branch on{" "}
            <code className="inline">error.code</code>, never on the sentence — the
            wording may change, the code will not.
          </p>
          <Code lang="json">{ERROR_SHAPE}</Code>
          <div style={{ marginTop: 16, display: "grid", gap: 4 }}>
            {CODES.map(([code, status, what]) => (
              <div key={code} style={{
                display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 11,
                alignItems: "baseline", padding: "7px 0",
                borderBottom: "1px solid var(--line)", fontSize: 13.8,
              }}>
                <code style={{ color: "var(--accent-ink)", fontWeight: 600 }}>{code}</code>
                <span className="faint" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{status}</span>
                <span className="muted">{what}</span>
              </div>
            ))}
          </div>
          <Note icon={<AlertTriangle size={17} />} tone="warn" style={{ marginTop: 18 }}>
            <code className="inline">unresolved</code> is the one status that is
            neither success nor failure: your wallet <b>was</b> debited but the
            supplier&apos;s answer never arrived. Do not retry — check{" "}
            <code className="inline">GET /v1/orders</code>, and open a ticket in the
            bot if it does not settle.
          </Note>

          {/* Limits */}
          <H id="limits">Limits</H>
          <div style={{ display: "grid", gap: 10, maxWidth: 640 }}>
            <Limit label="Requests" value="60 a minute, per key"
                   note="Exceeding it returns 429 rate_limited. Back off and retry." />
            <Limit label="Daily spend" value="500 USDT a day, per key"
                   note="Returns 429 daily_cap_reached. Ask support if you need it raised." />
            <Limit label="Quantity" value="1 to 1000 per order"
                   note="Stock is checked before anything is charged." />
          </div>

          {/* Endpoints */}
          <H id="endpoints">Endpoints</H>
          {/* One key for the whole page, sitting above the endpoints it
              unlocks. Retyping it per endpoint is how somebody ends up
              pasting a live key into the wrong box. */}
          <KeyBar />
          <div style={{ display: "grid", gap: 40 }}>
            {eps.map((ep) => <EndpointCard key={ep.op.operationId} ep={ep} />)}
          </div>

          {/* Schemas */}
          <H id="schemas">Schemas</H>
          <div style={{ display: "grid", gap: 10 }}>
            {schemas.map(([name, schema]) => (
              <SchemaCard key={name} name={name} schema={schema} />
            ))}
          </div>

          <div style={{
            marginTop: 40, border: "1px solid var(--line)",
            borderRadius: "var(--radius)", background: "var(--surface)",
            padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <span style={{ color: "var(--accent)", marginTop: 2 }}><Bug size={20} /></span>
            <div>
              <div style={{ fontWeight: 600 }}>Something not behaving?</div>
              <p className="muted" style={{ margin: "5px 0 0", fontSize: 14.5 }}>
                Open a ticket in the bot with your order reference —{" "}
                <code className="inline">ZEN-…</code> — and a person will answer in
                that chat. Include the <code className="inline">error.code</code> if
                there was one.
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{
      fontFamily: "var(--display)", fontWeight: 400, fontSize: 31,
      letterSpacing: "-.015em", margin: "52px 0 14px",
      paddingTop: 10, scrollMarginTop: 78,
    }}>{children}</h2>
  );
}

function SideGroup({ title, items, mono }: {
  title: string; items: [string, string][]; mono?: boolean;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 8 }}>{title}</div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
        {items.map(([label, href]) => (
          <li key={href}>
            <a href={href} className="side-link" style={{
              display: "block", padding: "4px 9px", borderRadius: 6,
              color: "var(--ink-soft)", fontSize: mono ? 12.5 : 14,
              fontFamily: mono ? "var(--mono)" : "inherit",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Note({ icon, children, tone, style }: {
  icon: React.ReactNode; children: React.ReactNode;
  tone?: "warn"; style?: React.CSSProperties;
}) {
  const accent = tone === "warn" ? "var(--warn)" : "var(--accent)";
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      border: "1px solid var(--line)", borderLeft: `2px solid ${accent}`,
      borderRadius: "var(--radius-sm)", background: "var(--surface)",
      padding: "13px 15px", margin: "0 0 16px", maxWidth: 640,
      fontSize: 14.5, lineHeight: 1.6,
      ...style,
    }}>
      <span style={{ color: accent, marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div className="muted">{children}</div>
    </div>
  );
}

function Limit({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: "var(--radius-sm)",
      background: "var(--surface)", padding: "12px 14px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, fontSize: 14.5 }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 13.5, color: "var(--accent-ink)" }}>{value}</span>
      </div>
      <p className="muted" style={{ margin: "5px 0 0", fontSize: 13.6 }}>{note}</p>
    </div>
  );
}
