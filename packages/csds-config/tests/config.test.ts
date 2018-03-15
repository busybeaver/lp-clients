import { DefaultCsdsConfig, DefaultCsdsServiceConfig } from "../src/config";

const qaDomain = "hc1n.dev.lrnd.net";
const prodDomain = "adminlogin.liveperson.net";
const accountId1 = "123456";
const accountId2 = "le123456";
const csdsDomain = "foo.bar";
const service = "testService";

test("DefaultCsdsConfig constructor", () => {
  const config1 = new DefaultCsdsConfig({ accountId: accountId1, csdsDomain });
  expect(config1.accountId).toBe(accountId1);
  expect(config1.csdsDomain).toBe(csdsDomain);

  const config2 = new DefaultCsdsConfig({ accountId: accountId1 });
  expect(config2.accountId).toBe(accountId1);
  expect(config2.csdsDomain).toBe(prodDomain);

  const config3 = new DefaultCsdsConfig({ accountId: accountId2 });
  expect(config3.accountId).toBe(accountId2);
  expect(config3.csdsDomain).toBe(qaDomain);
});

test("exposes DefaultCsdsServiceConfig", () => {
  const config1 = new DefaultCsdsServiceConfig({ accountId: accountId1, csdsDomain, service });
  expect(config1.accountId).toBe(accountId1);
  expect(config1.csdsDomain).toBe(csdsDomain);
  expect(config1.service).toBe(service);

  const config2 = new DefaultCsdsServiceConfig({ accountId: accountId1, service });
  expect(config2.accountId).toBe(accountId1);
  expect(config2.csdsDomain).toBe(prodDomain);
  expect(config2.service).toBe(service);

  const config3 = new DefaultCsdsServiceConfig({ accountId: accountId2, service });
  expect(config3.accountId).toBe(accountId2);
  expect(config3.csdsDomain).toBe(qaDomain);
  expect(config3.service).toBe(service);
});
