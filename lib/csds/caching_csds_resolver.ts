import * as memorize from "mem";

import { SimpleCsdsResolver } from "./simple_csds_resolver";
import { CsdsResponse, ICsdsConfig } from "./csds_config";

export class CachingCsdsResolver extends SimpleCsdsResolver {
  private readonly cachedResolve: (options: ICsdsConfig) => Promise<CsdsResponse>;

  constructor(maxAge: number = 1000 * 60 * 10) {
    super();
    const cacheKey = (options: ICsdsConfig): string => options.accountId;
    this.cachedResolve = memorize(super.resolve, {maxAge, cacheKey});
  }

  public resolve(options: ICsdsConfig): Promise<CsdsResponse> {
    return this.cachedResolve(options);
  }
}
