import { Required } from "type-zoo";

import { IUserSession } from "@lp-libs/le-session-provider";
import { ILeClientConfig, DefaultLeClientConfig, ILeClientConfigBase } from "@lp-libs/le-client";
import { ITransport, ITransportConfig, DefaultTransportConfig } from "@lp-libs/transport";

// mark everything optional which has default settings in the default config
export interface ITransportClientConfigBase<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  extends ILeClientConfigBase<CredentialsType, SessionType> {

  readonly transport: ITransport<SendType, ReceiveType, SessionType, TransportConfigType>;
  readonly transportConfig: TransportConfigType;
}

export type ITransportClientConfig<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  = Required<ITransportClientConfigBase<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType>>;

export class DefaultTransportClientConfig<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  extends DefaultLeClientConfig<CredentialsType, SessionType>
  implements ITransportClientConfig<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType> {

  public readonly transport: ITransport<SendType, ReceiveType, SessionType, TransportConfigType>;
  public readonly transportConfig: TransportConfigType;

  constructor(config: ITransportClientConfigBase<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType>) {
    super(config);
    this.transport = config.transport;
    this.transportConfig = config.transportConfig;
  }
}
