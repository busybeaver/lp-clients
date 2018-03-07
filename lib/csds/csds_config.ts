import { Required } from "type-zoo";
import { initConfig } from "../util/config";

/** get the CSDS domain in cases where we not necessarily have the domain (mostly on the consumer side) */
const getCsdsDomain = (accountId: string): string => (accountId.startsWith("le") || accountId.startsWith("qa")) ? "hc1n.dev.lrnd.net" : "adminlogin.liveperson.net";

export type CsdsResponse = { [name: string]: string };

// mark everything optional which has default settings in the default config
interface ICsdsConfigBase {
  accountId: string;
  csdsDomain?: string;
}

export type ICsdsConfig = Required<ICsdsConfigBase>;

// mark everything optional which has default settings in the default config
interface ICsdsServiceConfigBase extends ICsdsConfigBase {
  service: string;
}

export type ICsdsServiceConfig = Required<ICsdsServiceConfigBase>;

export class DefaultCsdsConfig implements ICsdsConfig {
  public accountId: string;
  public csdsDomain: string;

  constructor(config: ICsdsConfigBase) {
    initConfig(this, config);
    this.csdsDomain = this.csdsDomain || getCsdsDomain(this.accountId);
  }
}

export class DefaultCsdsServiceConfig extends DefaultCsdsConfig implements ICsdsServiceConfig {
  public service: string;

  constructor(config: ICsdsServiceConfigBase) {
    super(config);
  }
}
