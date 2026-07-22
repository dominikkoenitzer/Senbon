import type { NextConfig } from "next";

const noIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value:
      "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai",
  },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: "interest-cohort=()" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  experimental: {
    /*
     * Cross-fades route changes through the View Transitions API instead of
     * swapping the DOM outright, so navigating reads as one continuous surface
     * rather than a new document. The atmosphere and the floating controls opt
     * out of the animation in globals.css and stay perfectly still across it.
     */
    viewTransition: true,
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
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;
