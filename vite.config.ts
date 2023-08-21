import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: { index: "./src/index.ts" },
      formats: ["es", "iife"],
      name: "SetCookieParser",
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.${format}.js`,
    },
  },
  test: {
    coverage: {
      reporter: ["text", "clover", "json"],
    },
  },
});
