// Config terpisah dari vite.config.ts karena config aplikasi memakai wrapper
// @lovable.dev/vite-tanstack-config yang tidak menerima blok `test`.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
