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
