/// <reference types="expect-more-jest" />

import { IMockCsdsResolver } from "@lp-libs/csds-resolver/mocks";

beforeAll(async () => {
  const mocks = await import("@lp-libs/csds-resolver/mocks");
  jest.mock("@lp-libs/csds-simple-resolver", () => {
    return {
      SimpleCsdsResolver: mocks.MockCsdsResolver,
    };
  });
});

afterAll(() => jest.unmock("@lp-libs/csds-simple-resolver"));

test("CachingCsdsResolver functionality", async () => {
  const { CachingCsdsResolver } = await import("./resolver");

  const das = CachingCsdsResolver;
  const csdsResolver = new CachingCsdsResolver() as any as IMockCsdsResolver;

  const param = { accountId: "123456", csdsDomain: "test.domain" };
  const paramService = Object.assign({ service: "foo" }, param);

  await expect(csdsResolver.resolveService(paramService)).resolves.toEqual(csdsResolver.response.foo);
  csdsResolver.response = Object.assign({}, csdsResolver.response, { foo: "test.net" }); // ensure new csdsResolver.response object
  await expect(csdsResolver.resolveService(paramService)).resolves.not.toEqual(csdsResolver.response.foo); // caching

  await expect(csdsResolver.resolve(param)).resolves.toEqual(expect.objectContaining(csdsResolver.response));
  csdsResolver.response = { hello: "world.com" }; // ensure new csdsResolver.response object
  await expect(csdsResolver.resolve(param)).resolves.not.toEqual(expect.objectContaining(csdsResolver.response)); // caching
});
