import { Required } from "type-zoo";
import { ITransportConfigBase, DefaultTransportConfig } from "../transport_config";
import { IUserSession } from "../../live_engage/session_provider";

/**
 * The connections strategies determine whether the websocket should be opened only for sending a single message, or kept open until
 * it is actively closed by close() or a timeout is reached. The timeout can also be specified via a Config object
 */
export enum ConnectionStrategy {
  LEAVE_OPEN,
  CLOSE_IMMEDIATE,
  CLOSE_AFTER_TIMEOUT,
}

// mark everything optional which has default settings in the default config
interface IWsTransportConfigBase<SessionType extends IUserSession> extends ITransportConfigBase<SessionType> {
  pingInterval?: number;
  /** Number of queue workers. NOTE: with number > 1, ordering can not be guaranteed! */
  queueWorker?: number;
  /** Time until the websocket is closed after it has seen the last message */
  drainTimeoutMs?: number;
  /** Interval for checking if the ws is open before sending a message */
  messagingRetryIntervalMs?: number;
  /** Number of retries for checking if the ws is open before emitting an error/dropping the message */
  messagingMaxRetries?: number;
  connectionStrategy?: ConnectionStrategy;
}

export type IWsTransportConfig<SessionType extends IUserSession> = Required<IWsTransportConfigBase<SessionType>>;

export class DefaultWsTransportConfig<SessionType extends IUserSession> extends DefaultTransportConfig<SessionType> implements IWsTransportConfig<SessionType> {
  public static readonly PING_INTERVAL: number = 60000; /* 60secs seems suitable */
  /** Number of queue workers. NOTE: with number > 1, ordering can not be guaranteed! */
  public static readonly QUEUE_WORKER: number = 1;
  /** Time until the websocket is closed after it has seen the last message */
  public static readonly DRAIN_TIMEOUT_MS: number = 10000;
  /** Interval for checking if the ws is open before sending a message */
  public static readonly MESSAGING_RETRY_INTERVAL_MS: number = 100;
  /** Number of retries for checking if the ws is open before emitting an error/dropping the message */
  public static readonly MESSAGING_MAX_RETRIES: number = 10;
  public static readonly CONNECTION_STRATEGY: ConnectionStrategy = ConnectionStrategy.LEAVE_OPEN;

  public pingInterval: number = DefaultWsTransportConfig.PING_INTERVAL;
  /** Number of queue workers. NOTE: with number > 1, ordering can not be guaranteed! */
  public queueWorker: number = DefaultWsTransportConfig.QUEUE_WORKER;
  /** Time until the websocket is closed after it has seen the last message */
  public drainTimeoutMs: number = DefaultWsTransportConfig.DRAIN_TIMEOUT_MS;
  /** Interval for checking if the ws is open before sending a message */
  public messagingRetryIntervalMs: number = DefaultWsTransportConfig.MESSAGING_RETRY_INTERVAL_MS;
  /** Number of retries for checking if the ws is open before emitting an error/dropping the message */
  public messagingMaxRetries: number = DefaultWsTransportConfig.MESSAGING_MAX_RETRIES;
  public connectionStrategy: ConnectionStrategy = DefaultWsTransportConfig.CONNECTION_STRATEGY;

  constructor(config: IWsTransportConfigBase<SessionType>) {
    super(config);
  }
}
