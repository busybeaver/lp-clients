import { DefaultCsdsClientConfig, DEFAULT_CSDS_REFRESH_INTERVAL } from "../src/config";
import { ICsdsConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "@lp-libs/csds-resolver";
import { ILoggerFactory } from "@lp-libs/logger";

import * as TypeMoq from "typemoq";

// mock external components
const csdsConfig = TypeMoq.Mock.ofType<ICsdsConfig>().object;
const csdsResolver = TypeMoq.Mock.ofType<ICsdsResolver>().object;
const loggerFactory = TypeMoq.Mock.ofType<ILoggerFactory>().object;
const refreshInterval = 42;

test("init DefaultCsdsClientConfig", () => {
  const config = new DefaultCsdsClientConfig({ csdsConfig, csdsResolver, loggerFactory, refreshInterval });
  expect(config).toBeInstanceOf(DefaultCsdsClientConfig);
  expect(config.csdsConfig).toBe(csdsConfig);
  expect(config.csdsResolver).toBe(csdsResolver);
  expect(config.loggerFactory).toBe(loggerFactory);
  expect(config.refreshInterval).toBe(refreshInterval);
});

test("init DefaultCsdsClientConfig", () => {
  const config = new DefaultCsdsClientConfig({ csdsConfig, csdsResolver, loggerFactory });
  expect(config).toBeInstanceOf(DefaultCsdsClientConfig);
  expect(config.csdsConfig).toBe(csdsConfig);
  expect(config.csdsResolver).toBe(csdsResolver);
  expect(config.loggerFactory).toBe(loggerFactory);
  expect(config.refreshInterval).toBe(DEFAULT_CSDS_REFRESH_INTERVAL);
});
