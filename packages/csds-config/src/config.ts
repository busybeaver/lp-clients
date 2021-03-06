import { Required } from "type-zoo";

/** get the CSDS domain in cases where we not necessarily have the domain (mostly on the consumer side) */
const getCsdsDomain = (accountId: string): string => (accountId.startsWith("le") || accountId.startsWith("qa")) ? "hc1n.dev.lrnd.net" : "adminlogin.liveperson.net";

export type CsdsResponse = { [name: string]: string };

// mark everything optional which has default settings in the default config
export interface ICsdsConfigBase {
  readonly accountId: string;
  readonly csdsDomain?: string;
}

export type ICsdsConfig = Required<ICsdsConfigBase>;

// mark everything optional which has default settings in the default config
export interface ICsdsServiceConfigBase extends ICsdsConfigBase {
  readonly service: string;
}

export type ICsdsServiceConfig = Required<ICsdsServiceConfigBase>;

export class DefaultCsdsConfig implements ICsdsConfig {
  public readonly accountId: string;
  public readonly csdsDomain: string;

  constructor(config: ICsdsConfigBase) {
    this.accountId = config.accountId;
    this.csdsDomain = config.csdsDomain || getCsdsDomain(config.accountId);
  }
}

export class DefaultCsdsServiceConfig extends DefaultCsdsConfig implements ICsdsServiceConfig {
  public readonly service: string;

  constructor(config: ICsdsServiceConfigBase) {
    super(config);
    this.service = config.service;
  }
}
