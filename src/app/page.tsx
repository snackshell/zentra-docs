import Link from "next/link";
import {
  ArrowRight, BookOpen, Bot, Code2, CreditCard, KeyRound,
  LifeBuoy, Send, ShieldCheck, Wallet, Zap,
} from "lucide-react";
import { BOT_URL, Footer, Nav } from "@/components/Nav";
import { Code } from "@/components/Code";

const SAMPLE = `curl -X POST https://api.zentradigital.shop/v1/orders \\
  -H "Authorization: Bearer zen_live_..." \\
  -H "X-Idempotency-Key: order-1042" \\
  -d '{"product_id": 1, "quantity": 1}'`;

export default function Home() {
  return (
    <>
      <Nav />

      {/* ---- hero ---------------------------------------------------- */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* One ambient wash, low opacity. The page's boldness is spent on
            the wordmark and the buttons; this only stops the top of the
            page from being a flat rectangle. */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: "-40% 0 auto 0", height: 640,
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(168,85,247,.20), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="wrap" style={{ position: "relative", padding: "76px 24px 20px" }}>
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow">Telegram shop · Reseller API</span>
            <h1 style={{
              fontFamily: "var(--display)", fontWeight: 400,
              fontSize: "clamp(38px, 6.4vw, 62px)", lineHeight: 1.06,
              letterSpacing: "-.02em", margin: "14px 0 0", textWrap: "balance",
            }}>
              Premium digital accounts,{" "}
              <span className="grad">delivered the moment you pay.</span>
            </h1>
            <p className="muted" style={{
              fontSize: 17.5, margin: "20px 0 0", maxWidth: 590, lineHeight: 1.6,
            }}>
              Buy inside Telegram in two taps — or sell the same catalogue from
              your own bot with the Zentra Reseller API.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="btn">
                <Send size={17} strokeWidth={2} /> Open shop in Telegram
              </a>
              <Link href="/api/docs" className="btn-ghost">
                <BookOpen size={17} strokeWidth={2} /> Read the API docs
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 46, maxWidth: 760 }}>
            <Code lang="bash" label="One order, one call">{SAMPLE}</Code>
          </div>
        </div>
      </section>

      {/* ---- what you get ------------------------------------------- */}
      <section className="wrap" style={{ padding: "64px 24px 0" }}>
        <div style={{
          display: "grid", gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(248px, 1fr))",
        }}>
          <Feature icon={<Zap size={19} />} title="Instant delivery"
                   body="Codes arrive in the response. Nothing to poll, nothing to wait for, no approval queue." />
          <Feature icon={<Wallet size={19} />} title="One wallet"
                   body="Top up once with Telebirr, Bank of Abyssinia, USDT or Binance Pay. Spend it in the bot or over the API." />
          <Feature icon={<ShieldCheck size={19} />} title="Safe retries"
                   body="Send an idempotency key and a timeout costs you nothing. The retry returns the original order, never a second charge." />
        </div>
      </section>

      {/* ---- how it works ------------------------------------------- */}
      <section className="wrap" style={{ padding: "72px 24px 0" }}>
        <span className="eyebrow">For developers</span>
        <h2 style={{
          fontFamily: "var(--display)", fontWeight: 400, fontSize: 34,
          margin: "10px 0 8px", letterSpacing: "-.015em",
        }}>Four steps to your first sale</h2>
        <p className="muted" style={{ margin: "0 0 30px", maxWidth: 620 }}>
          You pay shop prices from your Zentra wallet, and resell at whatever
          you like. There is no application to fill in and no approval to wait for.
        </p>

        <ol style={{
          listStyle: "none", margin: 0, padding: 0,
          display: "grid", gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(232px, 1fr))",
        }}>
          <Step n={1} icon={<Bot size={17} />} title="Open the bot"
                body={<>Start <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--accent)" }}>@ZentraShopBot</a> in Telegram.</>} />
          <Step n={2} icon={<CreditCard size={17} />} title="Top up"
                body="Add funds with any payment method the shop already accepts." />
          <Step n={3} icon={<KeyRound size={17} />} title="Create a key"
                body="Tap API Link → Create API key. It is shown once." />
          <Step n={4} icon={<Code2 size={17} />} title="Start ordering"
                body={<>Point at <code className="inline">api.zentradigital.shop</code> and go.</>} />
        </ol>

        <div style={{ marginTop: 28 }}>
          <Link href="/api/docs" className="btn">
            Full API reference <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      {/* ---- support ------------------------------------------------- */}
      <section className="wrap" style={{ padding: "72px 24px 0" }}>
        <div style={{
          border: "1px solid var(--line)", borderRadius: "var(--radius)",
          background: "var(--surface)", padding: "26px 24px",
          display: "flex", flexWrap: "wrap", gap: 18,
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 560 }}>
            <span style={{ color: "var(--accent)", marginTop: 2 }}><LifeBuoy size={22} /></span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16.5 }}>Something wrong with an order?</div>
              <p className="muted" style={{ margin: "5px 0 0", fontSize: 14.5 }}>
                Open a ticket in the bot with your order reference — it starts
                with <code className="inline">ZEN-</code> — and a person answers
                in that chat.
              </p>
            </div>
          </div>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Send size={16} strokeWidth={2} /> Message support
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: "var(--radius)",
      background: "var(--surface)", padding: "20px 20px 22px",
    }}>
      <span style={{
        display: "grid", placeItems: "center", width: 38, height: 38,
        borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)",
      }}>{icon}</span>
      <h3 style={{ fontSize: 16.5, margin: "13px 0 5px", fontWeight: 600 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

function Step({ n, icon, title, body }: {
  n: number; icon: React.ReactNode; title: string; body: React.ReactNode;
}) {
  return (
    <li style={{
      border: "1px solid var(--line)", borderRadius: "var(--radius)",
      background: "var(--surface)", padding: "18px 18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 11.5, fontWeight: 600,
          color: "var(--accent)",
        }}>{String(n).padStart(2, "0")}</span>
        <span style={{ color: "var(--ink-faint)" }}>{icon}</span>
      </div>
      <h3 style={{ fontSize: 15.5, margin: "10px 0 4px", fontWeight: 600 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{body}</p>
    </li>
  );
}
