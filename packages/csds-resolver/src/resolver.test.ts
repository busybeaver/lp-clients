/// <reference types="expect-more-jest" />
import { AbstractCsdsResolver, ICsdsResolver } from "./resolver";
import { CsdsResponse, ICsdsConfig } from "@lp-libs/csds-config";

test("AbstractCsdsResolver functionality", async () => {
  const response = { myService: "global.internet.com", foo: "bar.com" };

  class TestCsdsResolver extends AbstractCsdsResolver {
    public readonly fn = jest.fn();
    public async resolve(config: ICsdsConfig) {
      this.fn(config);
      return response;
    }
    public hasServiceTest(csdsOptions: ICsdsConfig): boolean {
      return super.hasService(csdsOptions);
    }
  }

  const csdsResolver = new TestCsdsResolver();
  expect(csdsResolver).toBeInstanceOf(AbstractCsdsResolver);

  const param = { accountId: "123456", csdsDomain: "test.domain" };
  const paramService = Object.assign({ service: "foo" }, param);
  await expect(csdsResolver.resolveService(paramService)).resolves.toBe("bar.com");
  expect(csdsResolver.fn).toHaveBeenCalledTimes(1);
  expect(csdsResolver.fn).toHaveBeenLastCalledWith(paramService);

  await expect(csdsResolver.resolve(param)).resolves.toBe(response);
  expect(csdsResolver.fn).toHaveBeenCalledTimes(2);
  expect(csdsResolver.fn).toHaveBeenLastCalledWith(param);

  expect(csdsResolver.hasServiceTest(param)).toBeFalse();
  expect(csdsResolver.hasServiceTest(paramService)).toBeTrue();
});
