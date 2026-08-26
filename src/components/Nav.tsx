import Image from "next/image";
import Link from "next/link";
import { BookOpen, Send } from "lucide-react";

export const BOT_URL = "https://t.me/ZentraShopBot";

export function Nav() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "color-mix(in srgb, var(--ground) 82%, transparent)",
      backdropFilter: "blur(14px) saturate(160%)",
      WebkitBackdropFilter: "blur(14px) saturate(160%)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div className="wrap" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 62, gap: 16,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Mark />
          <span style={{
            fontFamily: "var(--display)", fontSize: 20, letterSpacing: "-.01em",
          }}>Zentra</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/api/docs" className="btn-ghost" style={{ padding: "9px 14px", fontSize: 14 }}>
            <BookOpen size={15} strokeWidth={2} />
            <span>API Docs</span>
          </Link>
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer"
             className="btn" style={{ padding: "9px 16px", fontSize: 14 }}>
            <Send size={15} strokeWidth={2} />
            <span>Open in Telegram</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

/**
 * The shop's actual logo — the same artwork the favicons are cut from.
 *
 * It was a drawn letter Z before, which was a stand-in until there was a
 * real mark. There is one now, so the site wears it rather than an
 * approximation of it.
 *
 * The artwork is circular with its own dark ground and its own neon ring,
 * so it is NOT given a background, a border or a shadow here — those would
 * be a second frame around something already framed. `aria-hidden` because
 * the wordmark beside it already names the shop; a screen reader announcing
 * "Zentra Zentra" is worse than one that says it once.
 */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <Image
      src="/android-chrome-192x192.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      priority
      style={{ borderRadius: "50%", flexShrink: 0, display: "block" }}
    />
  );
}

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", marginTop: 80 }}>
      <div className="wrap" style={{
        display: "flex", flexWrap: "wrap", gap: 14,
        alignItems: "center", justifyContent: "space-between",
        padding: "26px 24px",
      }}>
        <div className="faint" style={{ fontSize: 13.5, display: "flex", alignItems: "center", gap: 9 }}>
          <Mark size={20} />
          <span>Zentra Digital Shop</span>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 13.5 }} className="faint">
          <Link href="/api/docs">API Docs</Link>
          <a href="https://t.me/ZentraDigitalShop" target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href="https://t.me/seneex" target="_blank" rel="noopener noreferrer">Support</a>
        </div>
      </div>
    </footer>
  );
}
