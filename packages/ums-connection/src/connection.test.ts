/// <reference types="expect-more-jest" />
import { MockConnectionOpts } from "@lp-libs/transport/mocks";
import { IConnectionFactory, IConnectionOpts } from "@lp-libs/transport";
import { IUserSession } from "@lp-libs/le-session-provider";
import { AgentWsConnectionFactory, ConsumerWsConnectionFactory, BaseWsConnectionFactory } from "./connection";

const baseChecks = (factory: IConnectionFactory<IUserSession>, implClass: new (...args: any[]) => IConnectionFactory<IUserSession>, endpointContaining: string) => {
  expect(factory).toBeInstanceOf(BaseWsConnectionFactory);
  expect(factory).toBeInstanceOf(implClass);

  const connectionOpts = new MockConnectionOpts();
  expect(factory.headers).toBeFunction();
  expect(factory.headers(connectionOpts)).toEqual(expect.objectContaining({ Authorization: expect.stringContaining(connectionOpts.session.token)}));

  expect(factory.endpoint).toBeFunction();
  expect(factory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.domain));
  expect(factory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.session.accountId));
  expect(factory.endpoint(connectionOpts)).toEqual(expect.stringContaining(endpointContaining));
};

test("AgentWsConnectionFactory functionality", () => {
  const connectionFactory = new AgentWsConnectionFactory();
  baseChecks(connectionFactory, AgentWsConnectionFactory, "brand");

});

test("ConsumerWsConnectionFactory functionality", () => {
  const connectionFactory = new ConsumerWsConnectionFactory();
  baseChecks(connectionFactory, ConsumerWsConnectionFactory, "consumer");
});
