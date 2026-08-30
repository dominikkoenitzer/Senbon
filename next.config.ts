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
   * A baseline CSP for defense-in-depth. No script-src nonce policy yet: Next's
   * inline bootstrap makes that fiddly and there is no known injection today
   * (react-markdown runs without rehype-raw, everything else is auto-escaped).
   * These four directives are the cheap, safe wins: frame-ancestors is the
   * spoof-resistant successor to X-Frame-Options, and the rest lock down base
   * href, plugins, and form targets.
   */
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
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
