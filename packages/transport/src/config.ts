import { Required } from "type-zoo";
import { IUserSession } from "@lp-libs/le-session-provider";
import { IConnectionFactory } from "./connection";

/**
 * specification for transport configurations.
 */
// mark everything optional which has default settings in the default config
export interface ITransportConfigBase<SessionType extends IUserSession> {
  readonly connectionFactory: IConnectionFactory<SessionType>;
}

export type ITransportConfig<SessionType extends IUserSession> = Required<ITransportConfigBase<SessionType>>;

export class DefaultTransportConfig<SessionType extends IUserSession> implements ITransportConfig<SessionType> {
  public readonly connectionFactory: IConnectionFactory<SessionType>;

  constructor(config: ITransportConfigBase<SessionType>) {
    this.connectionFactory = config.connectionFactory;
  }
}
