module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/frontend/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/*.(test|spec).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: [
    "frontend/src/**/*.{js,jsx,ts,tsx}",
    "!frontend/src/**/*.d.ts",
    "!frontend/src/test/**/*",
    "!frontend/src/**/*.stories.*",
    "!frontend/src/**/*.test.*",
  ],
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/frontend/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testTimeout: 10000,
  maxWorkers: "50%",
};
