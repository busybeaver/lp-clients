import * as index from "./index";

test("exposes AgentWsConnectionFactory", () => {
  expect(index.AgentWsConnectionFactory).toBeDefined();
});

test("exposes BaseWsConnectionFactory", () => {
  expect(index.BaseWsConnectionFactory).toBeDefined();
});

test("exposes ConsumerWsConnectionFactory", () => {
  expect(index.ConsumerWsConnectionFactory).toBeDefined();
});
