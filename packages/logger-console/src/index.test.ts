import * as index from "./index";

test("exposes ConsoleLogger", () => {
  expect(index.ConsoleLogger).toBeDefined();
});

test("exposes ConsoleLoggerFactory", () => {
  expect(index.ConsoleLoggerFactory).toBeDefined();
});
