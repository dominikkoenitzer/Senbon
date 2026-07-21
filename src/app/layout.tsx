import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AtmosphereBackground from "@/components/AtmosphereBackground";
import ScrollRestoration from "@/components/ScrollRestoration";
import CommandPalette from "@/components/CommandPalette";
import ReadingProgress from "@/components/ReadingProgress";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

const heading = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
  preload: true,
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "system-ui",
    "sans-serif",
  ],
  preload: true,
});

const mono = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    template: "%s • Senbon Garden",
    default: "Senbon Garden Journal",
  },
  description: "A private digital garden.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
  other: {
    "X-Robots-Tag":
      "noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf5ec",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex"
        />
        <meta name="googlebot" content="noindex, nofollow, noarchive" />
        <meta name="bingbot" content="noindex, nofollow, noarchive" />
        <meta name="duckduckbot" content="noindex, nofollow" />
        <meta name="ai-content-declaration" content="no-training, no-indexing" />
      </head>
      <body
        className={`${heading.variable} ${body.variable} ${mono.variable} antialiased`}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AtmosphereBackground />
        <ReadingProgress />
        <ScrollRestoration />
        <main id="main-content" className="relative z-10">
          {children}
        </main>
        <CommandPalette />
        <BackToTop />
        <Analytics />
      </body>
    </html>
  );
}
