import type { NextConfig } from "next";

/**
 * A public documentation site. It holds no secrets and takes no input, so
 * the headers here are about what a browser should REFUSE to do with it —
 * not about protecting anything it stores.
 */
const config: NextConfig = {
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        // Nothing here belongs in a frame. A docs page inside somebody
        // else's iframe is a page being dressed up as theirs.
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // No API key should ever be typed into this site, and nothing here
        // asks for one — this stops a compromised dependency from
        // inventing a form that does.
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    }];
  },
};

export default config;
