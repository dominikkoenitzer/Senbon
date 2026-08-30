import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
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
