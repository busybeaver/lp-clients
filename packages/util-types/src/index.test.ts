/// <reference types="expect-more-jest" />
import * as index from "./index";
import { EventEmitter } from "events";

test("exposes isJsonArray", () => {
  expect(index.isJsonArray).toBeDefined();
  expect(index.isJsonArray).toBeFunction();
});

test("exposes isJsonObject", () => {
  expect(index.isJsonObject).toBeDefined();
  expect(index.isJsonObject).toBeFunction();
});

test("exposes TypedEventEmitter", () => {
  expect(index.TypedEventEmitter).toBeDefined();
});
