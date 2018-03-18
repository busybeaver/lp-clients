import { CsdsResponse, ICsdsConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "../src/resolver";

export const MockCsdsResolver = jest.fn<ICsdsResolver>(() => {
  return class implements ICsdsResolver {
    public resolve = jest.fn<Promise<CsdsResponse>>(() => {
      return Promise.resolve({
        myService: "global.internet.com",
        foo: "bar.com",
      });
    });
    public resolveService = jest.fn<Promise<string>>(() => {
      return Promise.resolve("bar.com");
    });
  };
});
