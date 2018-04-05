/// <reference types="expect-more-jest" />
import * as index from "./index";

test("exposes CachingCsdsResolver", () => {
  expect(index.CachingCsdsResolver).toBeDefined();
});

test("exposes DEFAULT_CACHE_MAX_AGE", () => {
  expect(index.DEFAULT_CACHE_MAX_AGE).toBeDefined();
  expect(index.DEFAULT_CACHE_MAX_AGE).toBeNumber();
  expect(index.DEFAULT_CACHE_MAX_AGE).toBeGreaterThan(0);
});
