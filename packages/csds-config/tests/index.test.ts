import * as index from "../src/index";

test("exposes DefaultCsdsConfig", () => {
  expect(index.DefaultCsdsConfig).toBeDefined();
});

test("exposes DefaultCsdsServiceConfig", () => {
  expect(index.DefaultCsdsServiceConfig).toBeDefined();
});
