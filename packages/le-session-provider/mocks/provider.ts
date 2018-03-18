import { IUserSession, ISessionProvider, ISessionProviderOptions } from "../src/provider";
import { MockCsdsConfig } from "@lp-libs/csds-config/mocks";
import { MockCsdsResolver } from "@lp-libs/csds-resolver/mocks";

// tslint:disable-next-line:no-empty-interface
export interface IMockCredentialsType { }

export interface IMockSessionProvider extends ISessionProvider<IMockCredentialsType, IUserSession> {
  success: boolean;
}

export const MockUserSession = jest.fn<IUserSession>(() => {
  return {
    accountId: "12345678",
    token: "mockToken",
  } as IUserSession;
});

export const MockSessionProviderOptions = jest.fn<ISessionProviderOptions>(() => {
  return {
    csdsConfig: new MockCsdsConfig(),
    csdsResolver: new MockCsdsResolver(),
  } as ISessionProviderOptions;
});

export const MockSessionProvider = jest.fn<IMockSessionProvider>(() => {
  return class implements IMockSessionProvider {
    public success = true;
    public login = jest.fn<Promise<IUserSession>>(() => {
      return this.success ? Promise.resolve(new MockUserSession()) : Promise.reject(new Error("expected failure"));
    });
    public refresh = jest.fn<Promise<void>>(() => {
      return this.success ? Promise.resolve() : Promise.reject(new Error("expected failure"));
    });
    public logout = jest.fn<Promise<void>>(() => {
      return this.success ? Promise.resolve() : Promise.reject(new Error("expected failure"));
    });
  };
});
