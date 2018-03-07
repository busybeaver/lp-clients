import { ILoggerFactory } from "../util/logger";
import { ITransportConfig } from "./transport_config";
import { IUserSession } from "../live_engage/session_provider";

export interface IConnectOptions<SessionType extends IUserSession, TransportConfigType extends ITransportConfig<SessionType>> {
  config: TransportConfigType;
  loggerFactory: ILoggerFactory;
  /** the (authenticated) session of the user/client */
  session: SessionType;
  domain: string;
}

/**
 * specification for transports.
 * @type SendType the supported type supported for sending
 * @type ReceiveType the type for received messages
 */
export interface ITransport<SendType, ReceiveType, SessionType extends IUserSession, TransportConfigType extends ITransportConfig<SessionType>> {

  /** true if the transport is connected; else false */
  isConnected(): boolean;

  /**
   * connects the transport to the endpoint. the promise resolves in
   * case of a successful connect; else the promise rejects. if the
   * transport is already connected, the promise instantly resolves.
   * @param options the configuration options to initialize and start/connect the transport
   */
  connect(options: IConnectOptions<SessionType, TransportConfigType>): Promise<void>;
  /**
   * disconnects the transport to the endpoint. the promise resolves in
   * case of a successful disconnect; else the promise rejects. if the
   * transport is already disconnected, the promise instantly resolves.
   */
  disconnect(): Promise<void>;
  /**
   * sends a message/event/object to the endpoint. the promise resolves in
   * case of successful sending; else the promise rejects.
   * @param obj the message/event/object which should be sent
   */
  sendMessage(obj: SendType): Promise<void>;
  /**
   * called in case of incoming messages/events/objects
   * @param cb the callback which is called on incoming data
   */
  onMessage(cb: (err?: Error | null, res?: ReceiveType) => void): void;

  /**
   * called in case of general transport errors like errors that happen
   * not in the context of a specific send/receive/connect/etc. context
   * (in case of errors during sending/receiving, the error callback/
   * promise.reject should be used)
   * @param cb the callback which is called in case of errors.
   */
  onError(cb: (err: Error) => void): void;
}
