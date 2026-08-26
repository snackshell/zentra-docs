import type { Metadata, Viewport } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// The same three faces the Mini App and the admin dashboard carry. A
// developer who has seen the shop should recognise the docs as the same
// company without being told.
const display = Instrument_Serif({
  subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono", display: "swap",
});

const SITE = "https://zentradigital.shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Zentra Digital Shop",
    template: "%s · Zentra Digital Shop",
  },
  description:
    "Premium digital accounts, delivered the moment you pay. Buy in Telegram, " +
    "or resell them from your own bot with the Zentra Reseller API.",
  openGraph: {
    title: "Zentra Digital Shop",
    description:
      "Premium digital accounts, delivered instantly. Buy in Telegram, or " +
      "resell from your own bot with the Reseller API.",
    url: SITE,
    siteName: "Zentra Digital Shop",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  // The favicon set lives in /public, generated from the shop's own logo.
  // Declared explicitly rather than relying on the app-directory convention
  // so the .ico, the PNG pair and the Apple touch icon are all named — a
  // browser that only understands one of them still gets a mark.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0713" },
    { media: "(prefers-color-scheme: light)", color: "#faf8fd" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
