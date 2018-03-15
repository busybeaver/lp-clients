const { join } = require('path');

module.exports = {
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(.*/tests/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node",
  ],
  coveragePathIgnorePatterns: [
    ".*/node_modules/.*",
    ".*/tests/.*",
    ".*/dist/.*",
    ".*/build/.*",
    ".*/generated/.*"
  ],
  /* coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  }, */
  collectCoverage: true,
  coverageDirectory: join(process.cwd(), "dist", "coverage"),
  globals: {
    "ts-jest": {
      enableTsDiagnostics: true,
    },
    "jest-junit": {
      output: process.env.JEST_JUNIT_OUTPUT || join(process.cwd(), "dist", "junit.xml"),
    },
  },
};
