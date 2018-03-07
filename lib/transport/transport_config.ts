import { Required } from "type-zoo";
import { initConfig } from "../util/config";
import { IUserSession } from "../live_engage/session_provider";
import { IConnectionFactory } from "./connection_factory";

/**
 * specification for transport configurations.
 */
// mark everything optional which has default settings in the default config
export interface ITransportConfigBase<SessionType extends IUserSession> {
  connectionFactory: IConnectionFactory<SessionType>;
}

export type ITransportConfig<SessionType extends IUserSession> = Required<ITransportConfigBase<SessionType>>;

export class DefaultTransportConfig<SessionType extends IUserSession> implements ITransportConfig<SessionType> {
  public connectionFactory: IConnectionFactory<SessionType>;

  constructor(config: ITransportConfigBase<SessionType>) {
    initConfig(this, config);
  }
}
