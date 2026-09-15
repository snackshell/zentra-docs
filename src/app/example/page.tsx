import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Bot, Coins, CreditCard, ExternalLink, FlaskConical,
  LayoutDashboard, LifeBuoy, ShieldCheck, Terminal, Wallet,
} from "lucide-react";
import { BOT_URL, Footer, Nav, REPO_URL } from "@/components/Nav";
import { Code } from "@/components/Code";

export const metadata: Metadata = {
  title: "Starter kit",
  description:
    "An open-source Telegram bot and admin dashboard that resells the Zentra " +
    "catalogue through the Reseller API. Clone it, point it at your own key, " +
    "and you have a shop.",
};

const CLONE = `git clone https://github.com/zentradigitalshop/zentraapibot-example
cd zentraapibot-example/bot

python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# BOT_TOKEN, ZENTRA_API_KEY, DATABASE_URL — the only three required
cp ../.env.example ../.env
psql "$DATABASE_URL" -f ../supabase/migrations/0001_initial_schema.sql

cd .. && python -m bot.bot`;

/** What ships in the repository, by the part of the job each piece does. */
const PARTS: [React.ReactNode, string, string][] = [
  [<Bot size={19} key="i" />, "The bot",
   "Catalogue, wallet, buying, the Zentra API client, the database and the settings system. Written with aiogram against PostgreSQL."],
  [<LayoutDashboard size={19} key="i" />, "Admin dashboard",
   "A separate Next.js app over the same database: overview, settings, orders, customers, deposits, and crediting a balance by hand."],
  [<Wallet size={19} key="i" />, "Four payment rails",
   "USDT on BEP-20 and Binance Pay confirm themselves. Telebirr and Bank of Abyssinia verify receipts through Zentra."],
  [<FlaskConical size={19} key="i" />, "Tests that can fail",
   "Twenty Python suites plus the dashboard's own. Every money-handling guard was verified by deliberately breaking it and watching the test catch it."],
];

export default function Example() {
  return (
    <>
      <Nav />

      {/* ---- hero ------------------------------------------------------ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{
          position: "absolute", inset: "-40% 0 auto 0", height: 620,
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(168,85,247,.18), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="wrap" style={{ position: "relative", padding: "68px 24px 20px" }}>
          <div style={{ maxWidth: 720 }}>
            <span className="eyebrow">Open source · MIT</span>
            <h1 style={{
              fontFamily: "var(--display)", fontWeight: 400,
              fontSize: "clamp(34px, 5.6vw, 54px)", lineHeight: 1.08,
              letterSpacing: "-.02em", margin: "14px 0 0", textWrap: "balance",
            }}>
              A whole shop,{" "}
              <span className="grad">already written.</span>
            </h1>
            <p className="muted" style={{
              fontSize: 17.5, margin: "20px 0 0", maxWidth: 600, lineHeight: 1.6,
            }}>
              A Telegram bot and admin dashboard that resell this catalogue
              through the Reseller API. Clone it, put your own key in{" "}
              <code className="inline">.env</code>, and you are selling — your
              markup, your customers, your payment methods.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn">
                <Terminal size={17} strokeWidth={2} /> View the repository
              </a>
              <Link href="/api/docs" className="btn-ghost">
                <BookOpen size={17} strokeWidth={2} /> API reference
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 44, maxWidth: 760 }}>
            <Code lang="bash" label="Clone to running bot">{CLONE}</Code>
          </div>
        </div>
      </section>

      {/* ---- what is in it --------------------------------------------- */}
      <section className="wrap" style={{ padding: "64px 24px 0" }}>
        <span className="eyebrow">What you get</span>
        <h2 style={{
          fontFamily: "var(--display)", fontWeight: 400, fontSize: 32,
          margin: "10px 0 8px", letterSpacing: "-.015em",
        }}>Not a stub with TODO where the money goes</h2>
        <p className="muted" style={{ margin: "0 0 28px", maxWidth: 620 }}>
          Every part below runs. The pieces that move money are the pieces
          that are tested hardest.
        </p>

        {/* Four items, so the track is sized to land them 2×2 rather than
            3 + 1 with one card stranded on its own row. Below ~760px they
            stack to a single column. */}
        <div style={{
          display: "grid", gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
        }}>
          {PARTS.map(([icon, title, body]) => (
            <div key={title} style={{
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
          ))}
        </div>
      </section>

      {/* ---- the honest part -------------------------------------------- */}
      <section className="wrap" style={{ padding: "64px 24px 0" }}>
        <div style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          border: "1px solid var(--line)", borderLeft: "2px solid var(--accent)",
          borderRadius: "var(--radius-sm)", background: "var(--surface)",
          padding: "15px 17px", maxWidth: 680, fontSize: 14.8, lineHeight: 1.62,
        }}>
          <span style={{ color: "var(--accent)", marginTop: 3, flexShrink: 0 }}>
            <ShieldCheck size={18} />
          </span>
          <div className="muted">
            <b style={{ color: "var(--ink)" }}>It works with no payment rail
            configured at all.</b> Customers browse the real catalogue at your
            markup, and you credit a balance by hand from the dashboard. That
            is not a placeholder standing in for the real thing — it is the
            fallback every rail keeps permanently, because a payment that
            matches nothing automatic should never mean a customer simply
            loses their money.
          </div>
        </div>
      </section>

      {/* ---- rails ------------------------------------------------------ */}
      <section className="wrap" style={{ padding: "64px 24px 0" }}>
        <span className="eyebrow">Taking money</span>
        <h2 style={{
          fontFamily: "var(--display)", fontWeight: 400, fontSize: 32,
          margin: "10px 0 8px", letterSpacing: "-.015em",
        }}>Four rails, added one at a time</h2>
        <p className="muted" style={{ margin: "0 0 26px", maxWidth: 620 }}>
          Each is self-contained. Turn on the ones you can support today and
          leave the rest switched off — nothing else breaks.
        </p>

        <div style={{ display: "grid", gap: 10, maxWidth: 680 }}>
          <Rail icon={<Coins size={17} />} name="USDT (BEP-20)"
                needs="A receiving address and one RPC endpoint"
                note="Watched on-chain. The amount itself is the fingerprint that matches a payment to the customer who owes it." />
          <Rail icon={<CreditCard size={17} />} name="Binance Pay"
                needs="Your Binance UID and a read-only API key"
                note="Not a merchant integration — it reads your own account's Pay history, which needs no business approval." />
          <Rail icon={<Wallet size={17} />} name="Telebirr"
                needs="Your account number and account name"
                note="Telebirr only answers Ethiopian IP addresses, so Zentra runs the receipt lookup for you with the key you already have. Nothing to host." />
          <Rail icon={<Wallet size={17} />} name="Bank of Abyssinia"
                needs="Your account number and account name"
                note="No geographic restriction on this one — the receipt check runs from wherever your bot does." />
        </div>
      </section>

      {/* ---- why not a fork --------------------------------------------- */}
      <section className="wrap" style={{ padding: "64px 24px 0" }}>
        <span className="eyebrow">Scope</span>
        <h2 style={{
          fontFamily: "var(--display)", fontWeight: 400, fontSize: 32,
          margin: "10px 0 8px", letterSpacing: "-.015em",
        }}>Why a starter kit and not a copy of the shop</h2>
        <p className="muted" style={{ margin: 0, maxWidth: 640 }}>
          The shop this is modelled on runs a VPS, a chain listener, a Binance
          merchant account, a separate payment-verification service and around
          fifteen thousand lines refined against real customers over months.
          Handing you all of that as day-one requirements would mean most
          people who want to resell never finish setup. This gives you a
          running bot today, and each rail as something you adopt when you are
          ready for what it needs — never before.
        </p>
      </section>

      {/* ---- go --------------------------------------------------------- */}
      <section className="wrap" style={{ padding: "56px 24px 0" }}>
        <div style={{
          border: "1px solid var(--line)", borderRadius: "var(--radius)",
          background: "var(--surface)", padding: "26px 24px",
          display: "flex", flexWrap: "wrap", gap: 18,
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 540 }}>
            <span style={{ color: "var(--accent)", marginTop: 2 }}><LifeBuoy size={22} /></span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16.5 }}>Stuck on setup?</div>
              <p className="muted" style={{ margin: "5px 0 0", fontSize: 14.5 }}>
                The repository&apos;s <code className="inline">docs/GUIDE.md</code>{" "}
                explains each rail in full. For anything it does not cover, open
                a ticket in <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}>@ZentraShopBot</a> and a person
                answers in that chat.
              </p>
            </div>
          </div>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <ExternalLink size={16} strokeWidth={2} /> Open on GitHub
          </a>
        </div>

        <div style={{ marginTop: 26 }}>
          <Link href="/api/docs" className="btn">
            Full API reference <ArrowRight size={16} strokeWidth={2.2} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

/**
 * A rail says what it costs you to switch on before it says what it does.
 * "Needs" is the question somebody actually has at this point in the page.
 */
function Rail({ icon, name, needs, note }: {
  icon: React.ReactNode; name: string; needs: string; note: string;
}) {
  return (
    <div style={{
      border: "1px solid var(--line)", borderRadius: "var(--radius-sm)",
      background: "var(--surface)", padding: "13px 15px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        alignItems: "baseline",
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, fontSize: 15 }}>
          <span style={{ color: "var(--ink-faint)" }}>{icon}</span>
          {name}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12.6, color: "var(--accent-ink)" }}>
          {needs}
        </span>
      </div>
      <p className="muted" style={{ margin: "6px 0 0", fontSize: 13.8, lineHeight: 1.58 }}>{note}</p>
    </div>
  );
}
