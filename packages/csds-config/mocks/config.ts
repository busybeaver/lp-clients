import {
  ICsdsConfig,
  ICsdsServiceConfig,
} from "../src/config";

export const MockCsdsConfig = jest.fn<ICsdsConfig>(() => {
  return {
    accountId: "42",
    csdsDomain: "foo.bar",
  } as ICsdsConfig;
});

export const MockCsdsServiceConfig = jest.fn<ICsdsServiceConfig>(() => {
  return {
    accountId: "42",
    csdsDomain: "foo.bar",
    service: "testService",
  } as ICsdsServiceConfig;
});
