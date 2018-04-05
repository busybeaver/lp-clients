/// <reference types="expect-more-jest" />
import { SimpleCsdsResolver } from "./resolver";
import { AbstractCsdsResolver } from "@lp-libs/csds-resolver";
import nock from "nock";

test("SimpleCsdsResolver functionality", async () => {
  const responseService = { foo: "bar.com" };
  const response = Object.assign({ myService: "global.internet.com" }, responseService);

  const csdsResolver = new SimpleCsdsResolver();
  expect(csdsResolver).toBeInstanceOf(AbstractCsdsResolver);
  expect(csdsResolver).toBeInstanceOf(SimpleCsdsResolver);

  const param = { accountId: "123456", csdsDomain: "test.domain" };
  const paramService = Object.assign({ service: "foo" }, param);

  nock(`https://${param.csdsDomain}`)
    .get(`/api/account/${param.accountId}/service/baseURI.json?version=1.0`)
    .reply(200);
  await expect(csdsResolver.resolve(param)).resolves.toBeEmptyObject();
  nock(`https://${param.csdsDomain}`)
    .get(`/api/account/${param.accountId}/service/baseURI.json?version=1.0`)
    .reply(200, {
      baseURIs: Object.entries(response).map(([service, baseURI]) => ({service, baseURI})),
    });
  await expect(csdsResolver.resolve(param)).resolves.toEqual(response);

  nock(`https://${paramService.csdsDomain}`)
    .get(`/api/account/${paramService.accountId}/service/${paramService.service}/baseURI.json?version=1.0`)
    .reply(200, {
      service: paramService.service,
      baseURI: response[paramService.service],
    });
  await expect(csdsResolver.resolve(paramService)).resolves.toEqual(responseService);
});
