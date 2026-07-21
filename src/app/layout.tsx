import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AtmosphereBackground from "@/components/AtmosphereBackground";
import "./globals.css";

/**
 * Fraunces over Playfair Display. Playfair is a literary-quarterly serif — it
 * made every headline read as solemn, which fought the voice. Fraunces is a
 * soft serif with SOFT and WONK axes: it still looks expensive, but it has a
 * grin in it. Set the axes in `.font-display` in globals.css.
 */
const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
  preload: true,
});

/** Nunito over Inter: rounded terminals, noticeably friendlier at body size. */
const body = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
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
        <main id="main-content" className="relative z-10">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
