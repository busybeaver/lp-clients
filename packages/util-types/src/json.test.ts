/// <reference types="expect-more-jest" />
import { isJsonArray, isJsonObject } from "./json";

test("isJsonArray", () => {
  expect(isJsonArray).toBeFunction();
  expect(isJsonArray("")).toBeFalse();
  expect(isJsonArray(2)).toBeFalse();
  expect(isJsonArray({})).toBeFalse();
  expect(isJsonArray([])).toBeTrue();
});

test("isJsonObject", () => {
  expect(isJsonObject).toBeFunction();
  expect(isJsonObject("")).toBeFalse();
  expect(isJsonObject(2)).toBeFalse();
  expect(isJsonObject({})).toBeTrue();
  expect(isJsonObject([])).toBeFalse();
});
