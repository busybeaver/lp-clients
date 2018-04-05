import * as index from "./index";

test("exposes DefaultLeClientConfig", () => {
  expect(index.DefaultLeClientConfig).toBeDefined();
});

test("exposes LeClient", () => {
  expect(index.LeClient).toBeDefined();
});
