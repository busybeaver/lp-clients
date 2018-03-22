import memorize from "mem";

import { SimpleCsdsResolver } from "@lp-libs/csds-simple-resolver";
import { CsdsResponse, ICsdsConfig, ICsdsServiceConfig } from "@lp-libs/csds-config";

export const DEFAULT_CACHE_MAX_AGE: number = 1000 * 60 * 10;

export class CachingCsdsResolver extends SimpleCsdsResolver {
  private readonly cachedResolve: (options: ICsdsConfig) => Promise<CsdsResponse>;

  constructor(maxAge: number = DEFAULT_CACHE_MAX_AGE) {
    super();
    const cacheKey = (options: ICsdsServiceConfig): string =>
      options.service ? `${options.accountId}_${options.service}` : options.accountId;
    this.cachedResolve = memorize(super.resolve, {maxAge, cacheKey});
  }

  public resolve(options: ICsdsConfig): Promise<CsdsResponse> {
    return this.cachedResolve(options);
  }
}
