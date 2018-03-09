import { IUserSession } from "@lp-libs/le-session-provider";
import { TransportClient } from "@lp-libs/transport-client";
import { IUmsClientConfig } from "./config";
import { ITransportConfig } from "@lp-libs/transport";
import { ISendType, IResponseType, INotificationType, INotificationsType, INotificationHandler, ISendHandler } from "@lp-libs/ums-generated";
import { setTimeout } from "timers";

export class UmsClient<ConfigType extends IUmsClientConfig<TransportConfigType, SendType, ResponseType, NotificationType, NotificationTypes, CredentialsType, SessionType>,
  TransportConfigType extends ITransportConfig<SessionType>, SendType extends ISendType,
  ResponseType extends IResponseType, NotificationType extends INotificationType,
  NotificationTypes extends INotificationsType<NotificationType>, CredentialsType,
  SessionType extends IUserSession>
  extends TransportClient<TransportConfigType, SendType, ResponseType | NotificationType, ConfigType, CredentialsType, SessionType>
  implements INotificationHandler<NotificationTypes, NotificationType>,
             ISendHandler<SendType, ResponseType>  {

  constructor(config: ConfigType, loggerName: string = "UmsClient") {
    super(config, loggerName);
    // allow only one listener per event; if we would have more at some point
    // in time, it would indicate an implementation issue; so set it here to
    // one so nodejs reports more than one listener per event
    this.config.umsResponseHandler.setMaxListeners(1);
  }

  // super.sendMessage() is called in the this.umsRequest() method
  public async sendMessage(req: SendType): Promise<ResponseType> {
    // the UMS specification/documentation mentions that the request id must be
    // unique for a transport session (i.e. the time between a connect() and a
    // disconnect() call);
    // this client only validates that there are no requests at the same time
    // with the same request id, since it would break the api contracts of the
    // client. due to the resulting overhead, we also don't want to store all
    // previous request id somewhere
    if (this.config.umsResponseHandler.listenerCount(req.id) > 0) throw new Error(`A request with the id '${req.id}' is already in progress`);

    return await Promise.race([this.umsRequest(req), this.timeout(req)])
      .catch((err: Error) => {
        // in the case of a rejection (could be a timeout or a failed request)
        // we remove/cleanup the listeners for this request (no need for the
        // listener anymore)
        this.config.umsResponseHandler.removeAllListeners(req.id);
        throw err;
      });
  }

  public onNotification<K extends keyof NotificationTypes>(notificationType: K, cb: (notification: NotificationTypes[K]) => void): void {
    this.checkStarted();
    this.config.umsNotificationHandler.on(notificationType, cb);
  }

  // the number of currently pending messages
  public get pendingMessages(): number {
    // since we only have one event per event (eventName === requestId), we
    // can easily count the number of currently pending messages/requests
    // by the number of eventNames
    return this.config.umsResponseHandler.eventNames().length;
  }

  // add functionality that should be called during the start task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStart(): Promise<void> {
    await super.onStart();
    this.onMessage((err?: Error | null, res?: ResponseType | NotificationType) => {
      if (err) return this.logger.error(err);
      if (res) {
        if (this.isResponseType(res)) return this.config.umsResponseHandler.emit(res.reqId, res);
        if (res.type) return this.config.umsNotificationHandler.emit(res.type, res);
      }
    });
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStop(): Promise<void> {
    await super.onStop();
    // cleanup all remaining listeners
    this.config.umsResponseHandler.removeAllListeners();
    this.config.umsNotificationHandler.removeAllListeners();
  }

  // no need for overriding 'onRefresh' in this class

  // else it's a NotificationType
  private isResponseType(res: ResponseType | NotificationType /* 'any' is just for TS */ | any): res is ResponseType {
    // only responses have a string property named 'reqId'; notifications obviously not,
    // since those are received without a corresponding request
    return typeof res.reqId === "string";
  }

  private umsRequest(req: SendType): Promise<ResponseType> {
    return new Promise((resolve, reject) => {
      this.config.umsResponseHandler.once(req.id, resolve);
      // sendMessage resolves when we pushed the message/request event successfully to UMS;
      // however, we want to wait until we get the actual message/response event from UMS;
      // but we are interested when the request fails, in this case we reject
      super.sendMessage(req).catch(reject); // use "super" NOT "this"!
    });
  }

  // actually this one never resolves... only rejects on timeout
  private timeout({ id }: SendType): Promise<ResponseType> {
    const { umsRequestTimeout } = this.config;
    return new Promise((resolve, reject) => setTimeout(() => reject(new Error(`Request '${id}' timed out; didn't receive response within ${umsRequestTimeout}`)), umsRequestTimeout));
  }
}
