import * as index from "./index";

test("exposes DefaultTransportClientConfig", () => {
  expect(index.DefaultTransportClientConfig).toBeDefined();
});

test("exposes TransportClient", () => {
  expect(index.TransportClient).toBeDefined();
});
