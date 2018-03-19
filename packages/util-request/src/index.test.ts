import * as index from "./index";

test("exposes get", () => {
  expect(index.get).toBeDefined();
});

test("exposes post", () => {
  expect(index.post).toBeDefined();
});

test("exposes request", () => {
  expect(index.request).toBeDefined();
});
