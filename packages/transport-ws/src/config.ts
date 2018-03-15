import { Required } from "type-zoo";
import { ITransportConfigBase, DefaultTransportConfig } from "@lp-libs/transport";
import { IUserSession } from "@lp-libs/le-session-provider";

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
export interface IWsTransportConfigBase<SessionType extends IUserSession> extends ITransportConfigBase<SessionType> {
  readonly pingInterval?: number;
  /** Number of queue workers. NOTE: with number > 1, ordering can not be guaranteed! */
  readonly queueWorker?: number;
  /** Time until the websocket is closed after it has seen the last message */
  readonly drainTimeoutMs?: number;
  /** Interval for checking if the ws is open before sending a message */
  readonly messagingRetryIntervalMs?: number;
  /** Number of retries for checking if the ws is open before emitting an error/dropping the message */
  readonly messagingMaxRetries?: number;
  readonly connectionStrategy?: ConnectionStrategy;
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

  public readonly pingInterval: number;
  /** Number of queue workers. NOTE: with number > 1, ordering can not be guaranteed! */
  public readonly queueWorker: number;
  /** Time until the websocket is closed after it has seen the last message */
  public readonly drainTimeoutMs: number;
  /** Interval for checking if the ws is open before sending a message */
  public readonly messagingRetryIntervalMs: number;
  /** Number of retries for checking if the ws is open before emitting an error/dropping the message */
  public readonly messagingMaxRetries: number;
  public readonly connectionStrategy: ConnectionStrategy = DefaultWsTransportConfig.CONNECTION_STRATEGY;

  constructor(config: IWsTransportConfigBase<SessionType>) {
    super(config);
    this.pingInterval = config.pingInterval || DefaultWsTransportConfig.PING_INTERVAL;
    this.queueWorker = config.queueWorker || DefaultWsTransportConfig.QUEUE_WORKER;
    this.drainTimeoutMs = config.drainTimeoutMs || DefaultWsTransportConfig.DRAIN_TIMEOUT_MS;
    this.messagingRetryIntervalMs = config.messagingRetryIntervalMs || DefaultWsTransportConfig.MESSAGING_RETRY_INTERVAL_MS;
    this.messagingMaxRetries = config.messagingMaxRetries || DefaultWsTransportConfig.MESSAGING_MAX_RETRIES;
    this.connectionStrategy = config.connectionStrategy || DefaultWsTransportConfig.CONNECTION_STRATEGY;
  }
}
