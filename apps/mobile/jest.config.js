module.exports = {
  preset: "jest-expo",
  silent: true,
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "json", "html", "lcov"],
  coverageThreshold: {
    "./src/application/mappers/feed.mapper.ts": {
      branches: 75,
      functions: 90,
      lines: 85,
      statements: 85,
    },
    "./src/application/mappers/message.mapper.ts": {
      branches: 50,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/application/mappers/chat.mapper.ts": {
      branches: 80,
      functions: 100,
      lines: 80,
      statements: 80,
    },
    "./src/application/use-cases/chat.use-cases.ts": {
      branches: 80,
      functions: 100,
      lines: 80,
      statements: 80,
    },
    "./src/application/use-cases/message.use-cases.ts": {
      branches: 80,
      functions: 100,
      lines: 80,
      statements: 80,
    },
    "./src/application/use-cases/auth.use-cases.ts": {
      branches: 80,
      functions: 100,
      lines: 80,
      statements: 80,
    },
    "./src/application/use-cases/feed.use-cases.ts": {
      branches: 80,
      functions: 100,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
};
