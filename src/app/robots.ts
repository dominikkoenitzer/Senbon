import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    // Search engines must be ALLOWED to crawl, or they never see the
    // noindex header/meta and index the bare URL from external links.
    // De-indexing is enforced by X-Robots-Tag (next.config.ts) + metadata.robots.
    { userAgent: "*", allow: "/" },
    { userAgent: "GPTBot", disallow: "/" },
    { userAgent: "ChatGPT-User", disallow: "/" },
    { userAgent: "OAI-SearchBot", disallow: "/" },
    { userAgent: "ClaudeBot", disallow: "/" },
    { userAgent: "Claude-Web", disallow: "/" },
    { userAgent: "anthropic-ai", disallow: "/" },
    { userAgent: "Google-Extended", disallow: "/" },
    { userAgent: "PerplexityBot", disallow: "/" },
    { userAgent: "Perplexity-User", disallow: "/" },
    { userAgent: "CCBot", disallow: "/" },
    { userAgent: "Bytespider", disallow: "/" },
    { userAgent: "Amazonbot", disallow: "/" },
    { userAgent: "Applebot-Extended", disallow: "/" },
    { userAgent: "FacebookBot", disallow: "/" },
    { userAgent: "Meta-ExternalAgent", disallow: "/" },
    { userAgent: "DiffBot", disallow: "/" },
    { userAgent: "ImagesiftBot", disallow: "/" },
    { userAgent: "Omgilibot", disallow: "/" },
    { userAgent: "cohere-ai", disallow: "/" },
    { userAgent: "Timpibot", disallow: "/" },
    { userAgent: "YouBot", disallow: "/" },
  ],
});

export default robots;
