import { DefaultCsdsConfig, DefaultCsdsServiceConfig } from "./config";

const qaDomain = "hc1n.dev.lrnd.net";
const prodDomain = "adminlogin.liveperson.net";
const accountId1 = "123456";
const accountId2 = "le123456";
const csdsDomain = "foo.bar";
const service = "testService";

test("init DefaultCsdsConfig", () => {
  const config = new DefaultCsdsConfig({ accountId: accountId1, csdsDomain });
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config.accountId).toBe(accountId1);
  expect(config.csdsDomain).toBe(csdsDomain);
});

test("init DefaultCsdsConfig", () => {
  const config = new DefaultCsdsConfig({ accountId: accountId1 });
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config.accountId).toBe(accountId1);
  expect(config.csdsDomain).toBe(prodDomain);
});

test("init DefaultCsdsConfig", () => {
  const config = new DefaultCsdsConfig({ accountId: accountId2 });
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config.accountId).toBe(accountId2);
  expect(config.csdsDomain).toBe(qaDomain);
});

const csdsConfigInstanceChecks = (config: any) => {
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config).toBeInstanceOf(DefaultCsdsServiceConfig);
};

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId1, csdsDomain, service });
  csdsConfigInstanceChecks(config);
  expect(config.accountId).toBe(accountId1);
  expect(config.csdsDomain).toBe(csdsDomain);
  expect(config.service).toBe(service);
});

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId1, service });
  csdsConfigInstanceChecks(config);
  expect(config.accountId).toBe(accountId1);
  expect(config.csdsDomain).toBe(prodDomain);
  expect(config.service).toBe(service);
});

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId2, service });
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config).toBeInstanceOf(DefaultCsdsServiceConfig);
  expect(config.accountId).toBe(accountId2);
  expect(config.csdsDomain).toBe(qaDomain);
  expect(config.service).toBe(service);
});
