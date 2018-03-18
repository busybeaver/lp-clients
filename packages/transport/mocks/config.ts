import { IUserSession } from "@lp-libs/le-session-provider";
import { ITransportConfig } from "../src/config";
import { IConnectionFactory } from "../src/connection";
import { MockConnectionFactory } from "./connection";

export const MockTransportConfig = jest.fn<ITransportConfig<IUserSession>>(() => {
  return {
    connectionFactory: new MockConnectionFactory(),
  } as ITransportConfig<IUserSession>;
});
