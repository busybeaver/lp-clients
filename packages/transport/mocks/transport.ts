import { IUserSession } from "@lp-libs/le-session-provider";
import { MockUserSession } from "@lp-libs/le-session-provider/mocks";
import { MockLoggerFactory } from "@lp-libs/logger/mocks";
import { ITransportConfig } from "../src/config";
import { IConnectOptions, ITransport } from "../src/transport";
import { IConnectionFactory } from "../src/connection";
import { MockTransportConfig } from "./config";

export const MockConnectOptions = jest.fn<IConnectOptions<IUserSession, ITransportConfig<IUserSession>>>(() => {
  return {
    config: new MockTransportConfig(),
    loggerFactory: new MockLoggerFactory(),
    session: new MockUserSession(),
    domain: "foo.bar",
  } as IConnectOptions<IUserSession, ITransportConfig<IUserSession>>;
});

// tslint:disable-next-line:no-empty-interface
export interface IMockSendType { }

// tslint:disable-next-line:no-empty-interface
export interface IMockReceiveType { }

export interface IMockTransport extends ITransport<IMockSendType, IMockReceiveType, IUserSession, ITransportConfig<IUserSession>> {
  success: boolean;
  connected: boolean;
}

class MockTransportImpl implements IMockTransport {
  public success = true;
  public connected = true;
  public isConnected = jest.fn<boolean>(() => this.connected);
  public connect = jest.fn<Promise<void>>(() => {
    return this.success ? Promise.resolve() : Promise.reject(new Error("expected failure"));
  });
  public disconnect = jest.fn<Promise<void>>(() => {
    return this.success ? Promise.resolve() : Promise.reject(new Error("expected failure"));
  });
  public sendMessage = jest.fn<Promise<void>>(() => {
    return this.success ? Promise.resolve() : Promise.reject(new Error("expected failure"));
  });
  public onMessage = jest.fn<void>((cb: (err?: Error | null, res?: IMockReceiveType) => void) => {
    this.success ? cb(null, {}) : cb(new Error("expected failure"));
  });
  public onError = jest.fn<void>((cb: (err: Error) => void) => {
    cb(new Error("expected failure"));
  });
}

export const MockTransport = jest.fn<IMockTransport>(() => new MockTransportImpl());
