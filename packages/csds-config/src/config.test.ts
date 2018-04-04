import { DefaultCsdsConfig, DefaultCsdsServiceConfig, ICsdsServiceConfig } from "./config";

const qaDomain = "hc1n.dev.lrnd.net";
const prodDomain = "adminlogin.liveperson.net";
const accountId1 = "123456";
const accountId2 = "le123456";
const testCsdsDomain = "foo.bar";
const testService = "testService";

test("init DefaultCsdsConfig", () => {
  const config = new DefaultCsdsConfig({ accountId: accountId1, csdsDomain: testCsdsDomain });
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config.accountId).toBe(accountId1);
  expect(config.csdsDomain).toBe(testCsdsDomain);
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

const csdsServiceConfigChecks = (config: ICsdsServiceConfig, account: string, csdsDomain: string, service: string) => {
  expect(config).toBeInstanceOf(DefaultCsdsConfig);
  expect(config).toBeInstanceOf(DefaultCsdsServiceConfig);
  expect(config.accountId).toBe(account);
  expect(config.csdsDomain).toBe(csdsDomain);
  expect(config.service).toBe(service);
};

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId1, csdsDomain: testCsdsDomain, service: testService });
  csdsServiceConfigChecks(config, accountId1, testCsdsDomain, testService);
});

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId1, service: testService });
  csdsServiceConfigChecks(config, accountId1, prodDomain, testService);
});

test("init DefaultCsdsServiceConfig", () => {
  const config = new DefaultCsdsServiceConfig({ accountId: accountId2, service: testService });
  csdsServiceConfigChecks(config, accountId2, qaDomain, testService);
});
