import * as index from "./index";

test("exposes AuthenticatedSessionProvider", () => {
  expect(index.AuthenticatedSessionProvider).toBeDefined();
});

test("exposes ConsumerSessionProvider", () => {
  expect(index.ConsumerSessionProvider).toBeDefined();
});

test("exposes UnauthenticatedConsumerSessionProvider", () => {
  expect(index.UnauthenticatedConsumerSessionProvider).toBeDefined();
});
