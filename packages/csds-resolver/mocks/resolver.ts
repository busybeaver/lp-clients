import { CsdsResponse, ICsdsConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "../src/resolver";

export interface IMockCsdsResolver extends ICsdsResolver {
  success: boolean;
}

export const MockCsdsResolver = jest.fn<IMockCsdsResolver>(() => {
  return class implements IMockCsdsResolver {
    public success = true;
    public resolve = jest.fn<Promise<CsdsResponse>>(() => {
      if (!this.success) return Promise.reject(new Error("expected failure"));
      return Promise.resolve({
        myService: "global.internet.com",
        foo: "bar.com",
      });
    });
    public resolveService = jest.fn<Promise<string>>(() => this.resolve().then((data: CsdsResponse) => data.foo));
  };
});
