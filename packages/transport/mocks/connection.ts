import { IUserSession } from "@lp-libs/le-session-provider";
import { MockUserSession } from "@lp-libs/le-session-provider/mocks";
import { IConnectionOpts, IConnectionFactory } from "../src/connection";

export const MockConnectionOpts = jest.fn<IConnectionOpts<IUserSession>>(() => {
  return {
    domain: "foo.bar",
    session: new MockUserSession(),
  } as IConnectionOpts<IUserSession>;
});

export const MockConnectionFactory = jest.fn<IConnectionFactory<IUserSession>>(() => {
  return new (class implements IConnectionFactory<IUserSession> {
    public endpoint = jest.fn<string>(() => {
      return "https://foo.bar/endpoint";
    });
    public headers = jest.fn<{ [key: string]: string; }>(() => {
      return { "X-FOO": "bar" };
    });
  })();
});
