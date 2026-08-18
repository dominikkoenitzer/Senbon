import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The guestbook API is a separate deployable with its own package.json, so
    // its tests live beside it rather than under src/.
    include: ["src/**/*.test.ts", "server/**/*.test.js"],
    environment: "node",
  },
  resolve: {
    alias: {
      // "server-only" throws outside a React Server Component build; under
      // Vitest it only needs to resolve to nothing.
      "server-only": new URL("./test/stubs/server-only.ts", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
