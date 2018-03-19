import * as index from "./index";

test("exposes isJsonArray", () => {
  expect(index.isJsonArray).toBeDefined();
});

test("exposes isJsonObject", () => {
  expect(index.isJsonObject).toBeDefined();
});

test("exposes TypedEventEmitter", () => {
  expect(index.TypedEventEmitter).toBeDefined();
});
