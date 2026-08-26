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

/** The wordmark's Z, drawn rather than fetched — one less request and it
 *  inherits the gradient the rest of the identity uses. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: 8, flexShrink: 0,
      background: "var(--gradient)",
      display: "grid", placeItems: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.55,
      fontFamily: "var(--sans)", letterSpacing: "-.02em",
      boxShadow: "0 4px 14px rgba(124,58,237,.4)",
    }}>Z</span>
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
          <a href={BOT_URL} target="_blank" rel="noopener noreferrer">Telegram</a>
          <a href="https://t.me/ZentraShopBot" target="_blank" rel="noopener noreferrer">Support</a>
        </div>
      </div>
    </footer>
  );
}
