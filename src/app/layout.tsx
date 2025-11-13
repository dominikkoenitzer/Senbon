import type { Metadata } from "next";
import { Playfair_Display, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/particles/ParticleBackground";
import FloatingElements from "@/components/animations/FloatingElements";

const heading = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const mono = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s • Senbon Garden",
    default: "Senbon Garden Journal",
  },
  description:
    "A zen garden-inspired digital journal and guestbook, crafted at senbon.ch.",
  metadataBase: new URL("https://senbon.ch"),
  openGraph: {
    title: "Senbon Garden Journal",
    description:
      "A minimal zen garden journal for thoughts, notes, and guest messages.",
    url: "https://senbon.ch",
    siteName: "Senbon Garden",
    images: [
      {
        url: "/og-senbon.png",
        width: 1200,
        height: 630,
        alt: "Senbon garden hero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@senbonstudio",
    title: "Senbon Garden",
    description:
      "A minimal zen garden journal for thoughts, notes, and guest messages.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${heading.variable} ${body.variable} ${mono.variable} antialiased`}
      >
        <div className="noise-overlay" aria-hidden="true" />
        <ParticleBackground />
        <FloatingElements />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
