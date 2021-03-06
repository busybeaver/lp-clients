/// <reference types="expect-more-jest" />
import * as index from "./index";

test("exposes CsdsClient", () => {
  expect(index.CsdsClient).toBeDefined();
});

test("exposes DefaultCsdsClientConfig", () => {
  expect(index.DefaultCsdsClientConfig).toBeDefined();
});

test("exposes DEFAULT_CSDS_REFRESH_INTERVAL", () => {
  expect(index.DEFAULT_CSDS_REFRESH_INTERVAL).toBeDefined();
  expect(index.DEFAULT_CSDS_REFRESH_INTERVAL).toBeNumber();
  expect(index.DEFAULT_CSDS_REFRESH_INTERVAL).toBeGreaterThan(0);
});
