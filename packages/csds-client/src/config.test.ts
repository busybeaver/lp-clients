import { DefaultCsdsClientConfig, DEFAULT_CSDS_REFRESH_INTERVAL } from "./config";
import { MockCsdsConfig } from "@lp-libs/csds-config/mocks";
import { MockCsdsResolver } from "@lp-libs/csds-resolver/mocks";
import { MockLoggerFactory } from "@lp-libs/logger/mocks";

const csdsConfig = new MockCsdsConfig();
const csdsResolver = new MockCsdsResolver();
const loggerFactory = new MockLoggerFactory();
const refreshInterval = 42;

test("init DefaultCsdsClientConfig", () => {
  const config = new DefaultCsdsClientConfig({ csdsConfig, csdsResolver, loggerFactory });
  expect(config).toBeInstanceOf(DefaultCsdsClientConfig);
  expect(config.csdsConfig).toBe(csdsConfig);
  expect(config.csdsResolver).toBe(csdsResolver);
  expect(config.loggerFactory).toBe(loggerFactory);
  expect(config.refreshInterval).toBe(DEFAULT_CSDS_REFRESH_INTERVAL);
});

test("init DefaultCsdsClientConfig", () => {
  const config = new DefaultCsdsClientConfig({ csdsConfig, csdsResolver, loggerFactory, refreshInterval });
  expect(config).toBeInstanceOf(DefaultCsdsClientConfig);
  expect(config.csdsConfig).toBe(csdsConfig);
  expect(config.csdsResolver).toBe(csdsResolver);
  expect(config.loggerFactory).toBe(loggerFactory);
  expect(config.refreshInterval).toBe(refreshInterval);
});
