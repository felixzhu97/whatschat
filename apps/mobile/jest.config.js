module.exports = {
  preset: "jest-expo",
  silent: true,
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/src/(.*)$": "<rootDir>/src/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
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
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
  ],
};
