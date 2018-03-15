import { Required } from "type-zoo";

import { ILoggerFactory } from "@lp-libs/logger";
import { ICsdsConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "@lp-libs/csds-resolver";

// mark everything optional which has default settings in the default config
export interface ICsdsClientConfigBase {
  readonly csdsConfig: ICsdsConfig;
  readonly csdsResolver: ICsdsResolver;
  readonly loggerFactory: ILoggerFactory;
  readonly refreshInterval?: number;
}

export type ICsdsClientConfig = Required<ICsdsClientConfigBase>;

export class DefaultCsdsClientConfig implements ICsdsClientConfig {
  public readonly csdsConfig: ICsdsConfig;
  public readonly csdsResolver: ICsdsResolver;
  public readonly loggerFactory: ILoggerFactory;
  public readonly refreshInterval: number;

  constructor(config: ICsdsClientConfigBase) {
    this.csdsConfig = config.csdsConfig;
    this.csdsResolver = config.csdsResolver;
    this.loggerFactory = config.loggerFactory;
    this.refreshInterval = config.refreshInterval || 10 * 60 * 1000; // 10 min
  }
}
