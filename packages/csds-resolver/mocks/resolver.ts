import { CsdsResponse, ICsdsConfig, ICsdsServiceConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "../src/resolver";

export interface IMockCsdsResolver extends ICsdsResolver {
  success: boolean;
  response: CsdsResponse;
}

export const MockCsdsResolver = jest.fn<IMockCsdsResolver>(() => {
  return new (class implements IMockCsdsResolver {
    public success = true;
    public response = {
      myService: "global.internet.com",
      foo: "bar.com",
    };
    public resolve = jest.fn<Promise<CsdsResponse>>((options: ICsdsConfig) => {
      if (this.success) return Promise.resolve(this.response);
      return Promise.reject(new Error("expected failure"));
    });
    public resolveService = jest.fn<Promise<string>>((config: ICsdsServiceConfig) => this.resolve(config).then((data: CsdsResponse) => data.foo));
  })();
});
