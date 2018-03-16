const { join } = require('path');

module.exports = {
  testEnvironment: "node",
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
  // coverage is ensured via codecov
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
  projects: [
    // "<rootDir>/packages/*/",
    join(process.cwd(), "packages", "*"),
  ],
  // setupTestFrameworkScriptFile: join(process.cwd(), "jest.setup.js"),
  unmockedModulePathPatterns: [
    "jasmine-expect",
  ],
  globals: {
    "ts-jest": {
      enableTsDiagnostics: true,
    },
    "jest-junit": {
      output: process.env.JEST_JUNIT_OUTPUT || join(process.cwd(), "dist", "junit.xml"),
    },
  },
};
