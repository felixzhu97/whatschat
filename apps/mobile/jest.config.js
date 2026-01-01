module.exports = {
  preset: "jest-expo",
  silent: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  // coverageReporters: ["text-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 90,
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
