import { CsdsClient } from "../src/client";
import { MockCsdsConfig } from "@lp-libs/csds-config/mocks";
import { MockCsdsResolver } from "@lp-libs/csds-resolver/mocks";
import { MockLoggerFactory } from "@lp-libs/logger/mocks";

const refreshInterval = 42;

test("init CsdsClient", () => {
  const csdsConfig = new MockCsdsConfig();
  const csdsResolver = new MockCsdsResolver();
  const loggerFactory = new MockLoggerFactory();
  const client = new CsdsClient({ csdsConfig, csdsResolver, loggerFactory, refreshInterval });
  expect(client).toBeInstanceOf(CsdsClient);
  expect(client.accountId).toBe(csdsConfig.accountId);
  expect(client.started).toBeFalsy();
  expect(loggerFactory.create).toHaveBeenCalledTimes(1);
});

test("CsdsClient start", async () => {
  const csdsConfig = new MockCsdsConfig();
  const csdsResolver = new MockCsdsResolver();
  const loggerFactory = new MockLoggerFactory();
  const client = new CsdsClient({ csdsConfig, csdsResolver, loggerFactory, refreshInterval });
  expect(client.started).toBeFalsy();
  await client.start();
  expect(client.started).toBeTruthy();
  expect(csdsResolver.resolve).toHaveBeenCalledTimes(1);
  expect(client.domains).toBe(csdsResolver.response);
});
