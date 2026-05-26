import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    { userAgent: "*", disallow: "/" },
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
