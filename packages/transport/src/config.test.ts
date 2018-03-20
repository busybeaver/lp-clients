import { IUserSession } from "@lp-libs/le-session-provider";
import { DefaultTransportConfig } from "./config";
import { IConnectionFactory } from "./connection";

const ConnectionFactory = jest.fn<IConnectionFactory<IUserSession>>();

test("init DefaultTransportConfig", () => {
  const connectionFactory = new ConnectionFactory();
  const config = new DefaultTransportConfig({ connectionFactory });
  expect(config).toBeInstanceOf(DefaultTransportConfig);
  expect(config.connectionFactory).toBe(connectionFactory);
});
