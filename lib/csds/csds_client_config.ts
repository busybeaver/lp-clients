import { Required } from "type-zoo";

import { ILoggerFactory } from "../util/logger";
import { ConsoleLoggerFactory } from "../util/console_logger";
import { ICsdsConfig } from "./csds_config";
import { ICsdsResolver } from "./csds_resolver";
import { CachingCsdsResolver } from "./caching_csds_resolver";
import { initConfig } from "../util/config";

// mark everything optional which has default settings in the default config
export interface ICsdsClientConfigBase {
  csdsConfig: ICsdsConfig;
  csdsResolver?: ICsdsResolver;
  loggerFactory?: ILoggerFactory;
  refreshInterval?: number;
}

export type ICsdsClientConfig = Required<ICsdsClientConfigBase>;

export class DefaultCsdsClientConfig implements ICsdsClientConfig {
  public csdsConfig: ICsdsConfig;
  public csdsResolver: ICsdsResolver = new CachingCsdsResolver();
  public loggerFactory: ILoggerFactory = new ConsoleLoggerFactory();
  public refreshInterval: number = 10 * 60 * 1000; // 10 min

  constructor(config: ICsdsClientConfigBase) {
    initConfig(this, config);
  }
}
