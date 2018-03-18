import * as index from "./index";

test("exposes DefaultCsdsConfig", () => {
  expect(index.DefaultCsdsConfig).toBeDefined();
});

test("exposes DefaultCsdsServiceConfig", () => {
  expect(index.DefaultCsdsServiceConfig).toBeDefined();
});
