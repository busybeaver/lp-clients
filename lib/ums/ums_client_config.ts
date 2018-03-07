import { Required } from "type-zoo";

import { IUserSession } from "../live_engage/session_provider";
import { ITransportClientConfig, DefaultTransportClientConfig, ITransportClientConfigBase } from "../transport/transport_client_config";
import { TypedEventEmitter } from "../util/event_emitter";
import { ITransportConfig } from "../transport/transport_config";
import { IIdGenerator, DefaultIdGenerator } from "./id_generator";
import { InitConnection } from "../generated/consumer_requests";
import { ISendType, IResponseType, INotificationType, INotificationsType } from "../generated/common_ums";

interface IUmsResponses<ResponseType> {
  [reqId: string]: ResponseType;
}

// mark everything optional which has default settings in the default config
export interface IUmsClientConfigBase<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType,
  NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  extends ITransportClientConfigBase<TransportConfigType, SendType, ResponseType | NotificationType, CredentialsType, SessionType> {

  umsNotificationHandler?: TypedEventEmitter<NotificationTypes>;
  umsResponseHandler?: TypedEventEmitter<IUmsResponses<ResponseType>>;
  umsRequestTimeout?: number; // in ms
  idGenerator?: IIdGenerator;
}

export type IUmsClientConfig<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType, NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  = Required<IUmsClientConfigBase<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType>>;

export class DefaultUmsClientConfig<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType, NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  extends DefaultTransportClientConfig<TransportConfigType, SendType, ResponseType | NotificationType, CredentialsType, SessionType>
  implements IUmsClientConfig<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType> {

  public umsNotificationHandler: TypedEventEmitter<NotificationType> = new TypedEventEmitter<NotificationType>();
  public umsResponseHandler: TypedEventEmitter<IUmsResponses<ResponseType>> = new TypedEventEmitter<IUmsResponses<ResponseType>>();
  public umsRequestTimeout: number = 10000; // in ms
  public idGenerator: IIdGenerator = new DefaultIdGenerator();

  constructor(config: IUmsClientConfigBase<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType>) {
    super(config);
  }
}
