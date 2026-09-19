import type { NextConfig } from "next";

const responseHeaders = [
  {
    key: "X-Robots-Tag",
    value:
      "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=(), interest-cohort=()",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // The guestbook posts a form, so it is worth saying it may not be framed.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // HSTS: senbon.ch and api.senbon.ch are both HTTPS, so pinning the scheme is
  // safe. Two years with preload is the submission-eligible baseline.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  /*
   * Defense-in-depth. `script-src` still carries 'unsafe-inline' because Next
   * streams its bootstrap through inline script tags and a nonce policy means
   * making every route dynamic; there is no known injection today anyway
   * (react-markdown runs without rehype-raw, everything else is auto-escaped).
   * It is worth stating regardless: 'self' still blocks an injected script tag
   * pointing at another origin, which is the shape an exfiltration would take.
   * Supabase is only ever reached from the server, so connect-src stays closed.
   */
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    /*
     * `viewTransition` is deliberately NOT enabled. Turning it on switches the
     * whole app onto Next's bundled prerelease React build
     * (next/dist/compiled/react-experimental), because <ViewTransition> does
     * not exist in the installed stable react. Route navigation stalled for
     * several seconds with it on, while server response stayed under 0.4s, so
     * the cost was entirely client-side. Shared-element morphs are not worth
     * running production on a prerelease renderer.
     */
    optimizePackageImports: [
      "lucide-react",
      "react-markdown",
      "remark-gfm",
      "rehype-highlight",
      "dayjs",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: responseHeaders,
      },
    ];
  },
};

export default nextConfig;
