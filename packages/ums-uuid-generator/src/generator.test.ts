/// <reference types="expect-more-jest" />
import { UUIDGenerator } from "./generator";

test("generateId", () => {
  const generator = new UUIDGenerator();
  expect(generator).toBeInstanceOf(UUIDGenerator);
  expect(generator.generateId).toBeFunction();
  expect(generator.generateId()).toBeString();
  expect(generator.generateId()).not.toBe(generator.generateId());
});
