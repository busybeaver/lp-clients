import * as index from "./index";

test("exposes DefaultUmsClientConfig", () => {
  expect(index.DefaultUmsClientConfig).toBeDefined();
});

test("exposes UmsClient", () => {
  expect(index.UmsClient).toBeDefined();
});
