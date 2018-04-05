const { join } = require("path");
const isCI = require("is-ci")

module.exports = {
  testEnvironment: "node",
  verbose: true,
  automock: false,
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: [
    // '**/__tests__/**/*.ts',
    '/**/?(*.)test.ts'
  ],
  moduleFileExtensions: [
    "ts",
    "js",
    "json",
    "node",
  ],
  coveragePathIgnorePatterns: [
    ".*/build/.*",
    ".*/dist/.*",
    ".*/generated/.*",
    ".*/mocks/.*",
    ".*/node_modules/.*",
    "\\.test\\.ts$",
  ],
  // // coverage is ensured via codecov
  // coverageThreshold: {
  //   global: {
  //     branches: 90,
  //     functions: 95,
  //     lines: 95,
  //     statements: 95,
  //   },
  // },
  collectCoverage: true,
  coverageDirectory: join(__dirname, "dist", "coverage"),
  rootDir: __dirname,
  projects: [
    // "<rootDir>/packages/*/",
    // join(__dirname, "packages", "*"),
  ],
  setupTestFrameworkScriptFile: require.resolve("expect-more-jest"),
  testResultsProcessor: isCI ? "jest-junit" : /* default */ undefined,
  globals: {
    "ts-jest": {
      enableTsDiagnostics: false,
      tsConfigFile: "tsconfig.test.json", // relative to the project's root directory
      babelConfig: {
        presets: [
          ["babel-preset-env", {
            targets: {
              node: "current",
            },
          }],
        ],
        plugins: [
          ["module-resolver", {
            //"root": ["./packages"],
            "cwd": __dirname,
            "alias": {
              "^@lp-libs/([^/]+)/mocks": "./packages/\\1/mocks",
              "^@lp-libs/([^/]+)": "./packages/\\1/src",
            },
            "extensions": [".js", ".ts"],
          }],
          "jest-hoist",
          "dynamic-import-node",
        ],
      },
    },
    "jest-junit": {
      output: process.env.JEST_JUNIT_OUTPUT || join(__dirname, "dist", "junit.xml"),
    },
  },
};
