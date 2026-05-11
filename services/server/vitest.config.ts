/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.d.ts',
    ],
    reporters: process.env.CI
      ? ['verbose']
      : ['default', 'verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      coverageSummary: 'json',
      exclude: [
        'node_modules/',
        'dist/',
        'prisma/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        global: {
          statements: 48,
          branches: 75,
          functions: 71,
          lines: 48,
        },
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
