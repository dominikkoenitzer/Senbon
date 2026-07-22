import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Fraunces, Nunito, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import AtmosphereBackground from "@/components/AtmosphereBackground";
import ChromeControls from "@/components/chrome/ChromeControls";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import ThemeScript from "@/components/chrome/ThemeScript";
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
    template: "%s • senbon",
    default: "senbon — journal and guestbook",
  },
  description:
    "The personal journal and guestbook of Dominik Könitzer. Please sign it.",
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

/*
 * `colorScheme` was "dark" while the palette rendered cream and
 * `html { color-scheme: light }` said otherwise — a leftover from the old dark
 * theme that told the browser to paint scrollbars and form controls dark on a
 * light page. Both schemes are genuinely supported now that the toggle exists.
 */
export const viewport: Viewport = {
  themeColor: "#fbf5ec",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <ThemeScript />
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
        {/*
          Only the content crossfades. The atmosphere and the floating controls
          are given their own view-transition names in globals.css and hold
          still through the swap, which is what stops a navigation from reading
          as "a new page loaded".
        */}
        <ViewTransition>
          <main id="main-content" className="relative z-10">
            {children}
          </main>
        </ViewTransition>
        <SmoothScroll />
        <ChromeControls />
        <Analytics />
      </body>
    </html>
  );
}
