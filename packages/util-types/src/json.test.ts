/// <reference types="expect-more-jest" />
import { isJsonArray, isJsonObject } from "./json";

const baseChecks = (fn) => {
  expect(fn).toBeFunction();
  expect(fn("")).toBeFalse();
  expect(fn(2)).toBeFalse();
  expect(fn(null)).toBeFalse();
  expect(fn(undefined)).toBeFalse();
};

test("isJsonArray", () => {
  baseChecks(isJsonArray);
  expect(isJsonArray({})).toBeFalse();
  expect(isJsonArray([])).toBeTrue();
});

test("isJsonObject", () => {
  baseChecks(isJsonArray);
  expect(isJsonObject({})).toBeTrue();
  expect(isJsonObject([])).toBeFalse();
});
