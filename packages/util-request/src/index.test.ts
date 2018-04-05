/// <reference types="expect-more-jest" />
import * as index from "./index";

test("exposes get", () => {
  expect(index.get).toBeDefined();
  expect(index.get).toBeFunction();
});

test("exposes post", () => {
  expect(index.post).toBeDefined();
  expect(index.post).toBeFunction();
});

test("exposes request", () => {
  expect(index.request).toBeDefined();
  expect(index.request).toBeFunction();
});
