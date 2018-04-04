/// <reference types="expect-more-jest" />
import { MockConnectionOpts } from "@lp-libs/transport/mocks";
import { IConnectionFactory, IConnectionOpts } from "@lp-libs/transport";
import { IUserSession } from "@lp-libs/le-session-provider";
import { AgentWsConnectionFactory, ConsumerWsConnectionFactory, BaseWsConnectionFactory } from "./connection";

const baseChecks = (factory: IConnectionFactory<IUserSession>): IConnectionOpts<IUserSession> => {
  expect(factory).toBeInstanceOf(BaseWsConnectionFactory);

  const connectionOpts = new MockConnectionOpts();
  expect(factory.headers).toBeFunction();
  expect(factory.headers(connectionOpts)).toEqual(expect.objectContaining({ Authorization: expect.stringContaining(connectionOpts.session.token)}));

  expect(factory.endpoint).toBeFunction();
  expect(factory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.domain));
  expect(factory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.session.accountId));
  return connectionOpts;
};

test("AgentWsConnectionFactory functionality", () => {
  const connectionFactory = new AgentWsConnectionFactory();
  const connectionOpts = baseChecks(connectionFactory);
  expect(connectionFactory).toBeInstanceOf(AgentWsConnectionFactory);
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining("brand"));
});

test("ConsumerWsConnectionFactory functionality", () => {
  const connectionFactory = new ConsumerWsConnectionFactory();
  const connectionOpts = baseChecks(connectionFactory);
  expect(connectionFactory).toBeInstanceOf(ConsumerWsConnectionFactory);
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining("consumer"));
});
