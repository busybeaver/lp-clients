/// <reference types="expect-more-jest" />
import { MockConnectionOpts } from "@lp-libs/transport/mocks";
import { AgentWsConnectionFactory, ConsumerWsConnectionFactory, BaseWsConnectionFactory } from "./connection";

test("AgentWsConnectionFactory functionality", () => {
  const connectionFactory = new AgentWsConnectionFactory();
  expect(connectionFactory).toBeInstanceOf(BaseWsConnectionFactory);
  expect(connectionFactory).toBeInstanceOf(AgentWsConnectionFactory);

  const connectionOpts = new MockConnectionOpts();
  expect(connectionFactory.headers).toBeFunction();
  expect(connectionFactory.headers(connectionOpts)).toEqual(expect.objectContaining({ Authorization: expect.stringContaining(connectionOpts.session.token)}));

  expect(connectionFactory.endpoint).toBeFunction();
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.domain));
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.session.accountId));
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining("brand"));
});

test("ConsumerWsConnectionFactory functionality", () => {
  const connectionFactory = new ConsumerWsConnectionFactory();
  expect(connectionFactory).toBeInstanceOf(BaseWsConnectionFactory);
  expect(connectionFactory).toBeInstanceOf(ConsumerWsConnectionFactory);

  const connectionOpts = new MockConnectionOpts();
  expect(connectionFactory.headers).toBeFunction();
  expect(connectionFactory.headers(connectionOpts)).toEqual(expect.objectContaining({ Authorization: expect.stringContaining(connectionOpts.session.token)}));

  expect(connectionFactory.endpoint).toBeFunction();
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.domain));
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining(connectionOpts.session.accountId));
  expect(connectionFactory.endpoint(connectionOpts)).toEqual(expect.stringContaining("consumer"));
});
