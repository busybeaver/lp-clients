/// <reference types="expect-more-jest" />
import { DefaultIDGenerator } from "./generator";

test("generateId", () => {
  const generator = new DefaultIDGenerator();
  expect(generator).toBeInstanceOf(DefaultIDGenerator);
  expect(generator.generateId).toBeFunction();
  expect(generator.generateId()).toBeString();
  expect(generator.generateId()).not.toBe(generator.generateId());
});
