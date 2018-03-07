import { LeClient } from "../live_engage/le_client";
import { IUserSession } from "../live_engage/session_provider";
import { ITransportClientConfig } from "./transport_client_config";
import { ITransportConfig } from "./transport_config";

export class TransportClient<TransportConfigType extends ITransportConfig<SessionType>, SendType, ReceiveType, ConfigType
  extends ITransportClientConfig<TransportConfigType, SendType, ReceiveType, CredentialsType, SessionType>, CredentialsType, SessionType extends IUserSession>
  extends LeClient<ConfigType, CredentialsType, SessionType> {

  constructor(config: ConfigType, loggerName: string = "TransportClient") {
    super(config, loggerName);
  }

  // we return a 'generic' any object in the promise resolution; methods overriding
  // this method should make the contract more strict and define acutal types
  protected sendMessage(obj: SendType): Promise<any> {
    this.checkStarted();
    return this.config.transport.sendMessage(obj);
  }

  protected onMessage(cb: (err?: Error | null, res?: ReceiveType) => void): void {
    this.checkStarted();
    this.config.transport.onMessage(cb);
  }

  // TODO: does this method needs to be public? what are the (negative) implications of making it public?
  protected onError(cb: (err: Error) => void): void {
    this.checkStarted();
    this.config.transport.onError(cb);
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStart(): Promise<void> {
    await super.onStart();
    const { accountId, csdsDomain } = this.config.csdsConfig;
    await this.config.transport.connect({
      config: this.config.transportConfig,
      loggerFactory: this.config.loggerFactory,
      session: this.credentials,
      domain: await this.config.csdsResolver.resolveService({ accountId, csdsDomain, service: "asyncMessagingEnt" }),
    });
    this.onError(this.logger.error);
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStop(): Promise<void> {
    await super.onStop();
    await this.config.transport.disconnect();
  }

  // no need for overriding 'refresh' in this class
}
