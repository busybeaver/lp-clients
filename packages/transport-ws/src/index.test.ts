import * as index from "./index";

test("exposes ConnectionStrategy", () => {
  expect(index.ConnectionStrategy).toBeDefined();
});

test("exposes DefaultWsTransportConfig", () => {
  expect(index.DefaultWsTransportConfig).toBeDefined();
});

test("exposes WsTransport", () => {
  expect(index.WsTransport).toBeDefined();
});
