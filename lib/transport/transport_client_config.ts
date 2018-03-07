import { Required } from "type-zoo";

import { IUserSession } from "../live_engage/session_provider";
import { ILeClientConfig, DefaultLeClientConfig, ILeClientConfigBase } from "../live_engage/le_client_config";
import { ITransport } from "./transport";
import { ITransportConfig, DefaultTransportConfig } from "./transport_config";

// mark everything optional which has default settings in the default config
export interface ITransportClientConfigBase<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  extends ILeClientConfigBase<CredentialsType, SessionType> {

  transport: ITransport<SendType, ReceiveType, SessionType, TransportConfigType>;
  transportConfig: TransportConfigType;
}

export type ITransportClientConfig<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  = Required<ITransportClientConfigBase<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType>>;

export class DefaultTransportClientConfig<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, CredentialsType, SessionType extends IUserSession>
  extends DefaultLeClientConfig<CredentialsType, SessionType>
  implements ITransportClientConfig<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType> {

  public transport: ITransport<SendType, ReceiveType, SessionType, TransportConfigType>;
  public transportConfig: TransportConfigType;

  constructor(config: ITransportClientConfigBase<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType>) {
    super(config);
  }
}
