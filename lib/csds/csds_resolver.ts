import { CsdsResponse, ICsdsConfig, ICsdsServiceConfig } from "./csds_config";

export interface ICsdsResolver {
  resolve(config: ICsdsConfig): Promise<CsdsResponse>;
  resolveService(config: ICsdsServiceConfig): Promise<string>;
}

export abstract class AbstractCsdsResolver implements ICsdsResolver {
  public abstract resolve(config: ICsdsConfig): Promise<CsdsResponse>;

  public async resolveService(config: ICsdsServiceConfig): Promise<string> {
    return (await this.resolve(config))[config.service];
  }

  protected hasService(csdsOptions: ICsdsConfig): csdsOptions is ICsdsServiceConfig {
    return "service" in csdsOptions;
  }
}
