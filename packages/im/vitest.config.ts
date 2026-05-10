import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    reporters: ['default', 'verbose'],
    coverage: {
      provider: 'v8',
      reporter: ["text", "json", "html"],
      reportsDirectory: './coverage',
      coverageSummary: 'json',
      exclude: ["node_modules", "dist", "*.config.*"],
      thresholds: {
        global: {
          statements: 65,
          branches: 80,
          functions: 75,
          lines: 65,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
