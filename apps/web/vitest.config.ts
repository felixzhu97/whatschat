/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    jsxImportSource: '@emotion/react',
  })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    pool: 'threads',
    reporters: process.env.CI
      ? ['default', 'github-actions', 'verbose']
      : ['default', 'verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        '__test__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '.next/**',
        'app/**',
        'src/shared/locales/**',
        'src/shared/i18n.ts',
        'src/domain/interfaces/**',
        'src/presentation/providers/**',
        'src/shared/types/**',
        'emotion-registry.tsx',
        'src/infrastructure/adapters/state/slices/**',
        'src/infrastructure/adapters/storage/**',
        'src/infrastructure/adapters/websocket/**',
        'src/infrastructure/rtc/**',
        'src/infrastructure/data/**',
      ],
      thresholds: {
        global: {
          statements: 43,
          branches: 80,
          functions: 55,
          lines: 43,
        },
      },
    },
  },
  resolve: {
    alias: [
      { find: /^@\/(shared|domain|infrastructure|application|presentation)\/(.*)/, replacement: path.resolve(__dirname, './src/$1/$2') },
      { find: /^@\//, replacement: path.resolve(__dirname, './') + '/' },
    ],
  },
})
