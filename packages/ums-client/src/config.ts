import { Required } from "type-zoo";

import { IUserSession } from "@lp-libs/le-session-provider";
import { ITransportClientConfig, DefaultTransportClientConfig, ITransportClientConfigBase } from "@lp-libs/transport-client";
import { TypedEventEmitter } from "@lp-libs/util-types";
import { ITransportConfig } from "@lp-libs/transport";
import { IIDGenerator, DefaultIDGenerator } from "@lp-libs/ums-id-generator";
import { ISendType, IResponseType, INotificationType, INotificationsType } from "@lp-libs/ums-generated";

export interface IUmsResponses<ResponseType> {
  [reqId: string]: ResponseType;
}

// mark everything optional which has default settings in the default config
export interface IUmsClientConfigBase<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType,
  NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  extends ITransportClientConfigBase<TransportConfigType, SendType, ResponseType | NotificationType, CredentialsType, SessionType> {

  readonly umsNotificationHandler?: TypedEventEmitter<NotificationTypes>;
  readonly umsResponseHandler?: TypedEventEmitter<IUmsResponses<ResponseType>>;
  readonly umsRequestTimeout?: number; // in ms
  readonly idGenerator?: IIDGenerator;
}

export type IUmsClientConfig<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType, NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  = Required<IUmsClientConfigBase<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType>>;

export class DefaultUmsClientConfig<TransportConfigType extends ITransportConfig<SessionType>,
  SendType extends ISendType, ResponseType extends IResponseType, NotificationType extends INotificationType, NotificationTypes extends INotificationsType<NotificationType>, CredentialsType, SessionType extends IUserSession>
  extends DefaultTransportClientConfig<TransportConfigType, SendType, ResponseType | NotificationType, CredentialsType, SessionType>
  implements IUmsClientConfig<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType> {

  public readonly umsNotificationHandler: TypedEventEmitter<NotificationTypes>;
  public readonly umsResponseHandler: TypedEventEmitter<IUmsResponses<ResponseType>>;
  public readonly umsRequestTimeout: number;
  public readonly idGenerator: IIDGenerator;

  constructor(config: IUmsClientConfigBase<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType>) {
    super(config);
    this.umsNotificationHandler = config.umsNotificationHandler || new TypedEventEmitter<NotificationTypes>();
    this.umsResponseHandler = config.umsResponseHandler || new TypedEventEmitter<IUmsResponses<ResponseType>>();
    this.umsRequestTimeout = config.umsRequestTimeout || 10000; // in ms
    this.idGenerator = config.idGenerator || new DefaultIDGenerator();
  }
}
