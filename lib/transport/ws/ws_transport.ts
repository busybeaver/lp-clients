import * as WebSocket from "ws";
import { queue, AsyncQueue } from "async";
import { EventEmitter } from "events";
import { inspect } from "util";
import { ILogger } from "../../util/logger";
import { ITransport, IConnectOptions } from "../transport";
import { IWsTransportConfig, DefaultWsTransportConfig, ConnectionStrategy } from "./ws_transport_config";
import { IUserSession } from "../../live_engage/session_provider";

// https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options
const enum WSEvents {
  OPEN = "open",
  CONNECTED = "connected",
  CLOSE = "close",
  ERROR = "error",
  MESSAGE = "message",
  HEADERS = "headers",
  PING = "ping",
  PONG = "pong",
  UNEXPECTED_RESPONSE = "unexpected-response",
}

/**
 * Publicly exposed events, the user can listen on
 *
 * @memberof Transport
 */
enum TransportEvent {
  ON_CONNECTING = "transport.ON_CONNECTING",
  ON_MESSAGE = "transport.ON_MESSAGE",
  ON_ERROR = "transport.ON_ERROR",
  ON_CLOSED = "transport.ON_CLOSED",
  ON_CONNECTED = "transport.ON_CONNECTED",
}

/**
 * Handler for WebSocket connections.
 *
 * As the underlying library we use https://github.com/websockets/ws/
 * For queueing we use https://caolan.github.io/async/docs.html#queue
 *
 * The Transport object can be conifgured by a Config object, @see TransportConfig
 *
 * @class Transport
 * @extends {EventEmitter}
 */
export class WsTransport<SendType, ReceiveType, SessionType extends IUserSession> extends EventEmitter implements ITransport<SendType, ReceiveType, SessionType, IWsTransportConfig<SessionType>> {

  /** The websocket handler */
  protected ws?: WebSocket;

  /** A sending queue, buffering messages in case the websocket is down. Is flushed on disconnect */
  private sendingQueue?: AsyncQueue<SendType>;
  private conf?: IWsTransportConfig<SessionType>;

  /** internally used; references for the heartbeat/ping/drain timers */
  private drainTimeoutHandle?: NodeJS.Timer;
  private hearBeatHandle?: NodeJS.Timer;
  private logger: ILogger;

  /**
   *
   * @param wsUrl the wss:// url the WebSocket should connect to
   * @param reuseOld Default is true. If false, the former WS connection is closed gracefully. If graceful close does not work, it will terminate the connection
   */
  public async connect({ config, loggerFactory, session, domain }: IConnectOptions<SessionType, IWsTransportConfig<SessionType>>): Promise<void> {
    this.logger = this.logger || loggerFactory.create("Transport");
    const conf = this.conf = this.adjustConfByConnectionStrategy(config);
    const endpoint = config.connectionFactory.endpoint({ session, domain });

    /*
     * Setting up a sending queue and its drain function. If ConnectionStrategy != LEAVE_OPEN, or we have timeout set,
     * the queue waits for this timeout and then closes the WebSocket connection. If a new message arrives, the timeout is reset of course.
     */
    this.logger.info("Creating a new sending queue...");
    this.sendingQueue = queue((task, callback) => this.transmit(task, callback)); // keep 'this' context
    this.sendingQueue.drain = () => this.drainHandler(); // keep 'this' context

    /**
     * Cleanup if necessary
     */
    if (this.isConnected()) {
      this.logger.warn(`Transport.connect() while already connected; disconnecting old connection first`);
      await this.disconnect(true);
    }

    /**
     * Connect
     */
    this.logger.verbose(`Connecting websocket on URL '${domain}'...`);
    const headers = config.connectionFactory.headers({ session, domain });
    const ws = this.ws = new WebSocket(endpoint, { headers }); // TODO: maybe check and throw error for UX sake
    super.emit(TransportEvent.ON_CONNECTING);

    this.logger.debug("Connecting...");

    /**
     * Add the event hooks
     */
    return new Promise<void>((resolve, reject) => {
      let opened = false;
      ws.on(WSEvents.OPEN, () => {
        this.logger.info("client <---> server (Connection established)");
        this.onConnectedHandler();
        opened = true;
        resolve();
      });
      ws.on(WSEvents.CLOSE, (code, reason) => {
        this.logger.info("client <-X-> server (code: %s reason: '%s')", code, reason);
        this.onClosedHandler(code, reason);
      });
      ws.on(WSEvents.ERROR, (err) => {
        this.logger.error("client -Err- server", err);
        this.onErrorHandler(err);
        if (!opened) reject(err); // don't reject a promise which was already solved (aka only reject on errors during the connect phase)
      });
      ws.on(WSEvents.MESSAGE, (data) => {
        this.logger.info("client <---- server (Message received)");
        this.logger.verbose("client <---- server", data);
        let msg: string = "";
        if (typeof data === "string") msg = data;
        if (Buffer.isBuffer(data)) msg = data.toString("utf8");
        // also handle Buffer[] and ArrayBuffer?
        this.onMessageHandler(msg);
      });
      ws.on(WSEvents.UNEXPECTED_RESPONSE, (req, res) => {
        this.logger.info("client --?-- server (Unexpected response)");
        this.logger.debug("Unexpected response %s %s", inspect(req, false, 2), inspect(res, false, 2));
      });
    });
  }

  public isConnected(): boolean {
    return this.ws !== undefined && this.ws.readyState === WebSocket.OPEN;
  }

  public sendMessages(messages: SendType[]): Promise<void> {
    return new Promise((resolve, reject) => this.sendWithCb((err) => err ? reject(err) : resolve(), ...messages));
  }

  public sendMessage(message: SendType): Promise<void> {
    return this.sendMessages([message]);
  }

  public onMessage(cb: (err?: Error | null, res?: ReceiveType) => void): void {
    super.on(TransportEvent.ON_MESSAGE, (obj: ReceiveType) => cb(null, obj));
  }

  public onError(cb: (err: Error) => void): void {
    this.on(TransportEvent.ON_ERROR, cb);
  }

  /**
   *
   * @memberof Transport
   * @param flushQueue If true, the queue will be recreated and all unprocessed items will be deleted!
   */
  public async disconnect(flushQueue = true): Promise<void> {
    this.logger.info("Disconnecting socket connection...");
    if (flushQueue && this.sendingQueue && this.sendingQueue.length() > 0) {
      // Remove the items and restart the queue
      this.sendingQueue.drain();
      this.sendingQueue.kill();
    }

    // remove references
    if (this.hearBeatHandle) clearTimeout(this.hearBeatHandle);
    delete this.hearBeatHandle;
    if (this.drainTimeoutHandle) clearTimeout(this.drainTimeoutHandle);
    delete this.drainTimeoutHandle;
    const ws = this.ws;
    delete this.ws;
    delete this.sendingQueue;
    delete this.conf;

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.removeListener(TransportEvent.ON_CONNECTED, reshandler);
        this.removeListener(TransportEvent.ON_ERROR, errhandler);
      };
      const reshandler = () => {
        cleanup();
        resolve();
      };
      const errhandler = (err: Error) => {
        cleanup();
        reject(err);
      };

      this.on(TransportEvent.ON_CLOSED, reshandler);
      this.on(TransportEvent.ON_ERROR, errhandler);

      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close(); // also calls 'this.onClosed'
      } else {
        this.onClosedHandler(null, null);
      }
    });
  }

  /**
   * Adds string messages to the queue and sends them over the WebSocket. Make sure you have
   * all handler (error, etc.) set up, so you get informed in case a message could not be delivered!
   * @param messages One or more messages which will be sent over the websocket
   * @param cb A callback which is called after the message has been transferred succesfully
   */
  protected sendWithCb(cb?: (err) => void, ...messages: SendType[]) {
    if (!cb) {
      cb = (err: Error) => {
        if (err) return this.logger.error("Error while processing messages: ", err);
        this.logger.info("Messages processed");
      };
    }
    this.sendingQueue
      ? this.sendingQueue.push(messages, cb)
      : cb(new Error("Cannot send message; queue not ready/available"));
  }

  /**
   * Pauses the queue processing
   */
  protected pause() {
    if (this.sendingQueue) this.sendingQueue.pause();
  }

  /**
   * Resumes the queue processing
   */
  protected resume() {
    if (this.sendingQueue) this.sendingQueue.resume();
  }

  /**
   * Queue worker. Only sends messages when the WebSocket is OPEN. If an error occurs, it re-adds the unsent message to the front
   * of the queue. Note: look also at the retries and retry intervals
   * @param message
   * @param cb
   */
  protected transmit(message: SendType, cb: (err?: string) => void) {
    if (!this.ws) {
      return cb("Socket is undefined! Did you forget to connect?");
    }

    this.waitForSocketConnection(
      this.ws,
      (err2) => {
        if (err2) {
          this.logger.error("Received an error when trying to send a message. Queue will be paused, message will be put back to the queue (preserved).");
          if (!this.sendingQueue) return cb("SendQueue not ready/present; not properly initialized/started the transport");
          this.sendingQueue.unshift(message, (err3) => {
            if (err3) return this.logger.error(err3);
            this.logger.info("Formerly failed message has now been delivered!");
          });
          return cb(err2);
        }

        if (!this.ws) return cb("failed to send message, since the socket isn't available/initialized");
        this.logger.info("client ----> server (Sending)");
        this.logger.verbose("client ----> server (msg: '%s')", message);
        this.ws.send(JSON.stringify(message), (err3) => {
          if (err3) {
            this.logger.error("Unable to send message over websocket! Err: " + err3);
            return cb(err3.message);
          }
          cb();
        });
      },
      this.conf ? this.conf.messagingRetryIntervalMs : DefaultWsTransportConfig.MESSAGING_RETRY_INTERVAL_MS,
      this.conf ? this.conf.messagingMaxRetries : DefaultWsTransportConfig.MESSAGING_MAX_RETRIES,
    );
  }

  protected drainHandler() {
    // TODO: add drain timeouts
    this.logger.debug("all items have been processed");
    if (this.drainTimeoutHandle) clearTimeout(this.drainTimeoutHandle);
    delete this.drainTimeoutHandle;
    if ((this.conf ? this.conf.connectionStrategy : DefaultWsTransportConfig.CONNECTION_STRATEGY) !== ConnectionStrategy.LEAVE_OPEN) {
      this.drainTimeoutHandle = setTimeout(() => {
        this.logger.verbose(
          "Closing WS connection, because we haven't seen messages since %s ms...",
          this.conf ? this.conf.drainTimeoutMs : DefaultWsTransportConfig.DRAIN_TIMEOUT_MS,
        );
        this.disconnect();
      }, this.conf ? this.conf.drainTimeoutMs : DefaultWsTransportConfig.DRAIN_TIMEOUT_MS);
    }
  }

  protected onConnectedHandler() {
    super.emit(TransportEvent.ON_CONNECTED);
    this.resume();
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // TODO: verify and remove!
      this.logger.error(new Error(`THIS STATE SHOULD NOT OCCUR! ws = ${this.ws} state = ${this.ws ? this.ws.readyState : "unknown"}`));
    }
  }

  protected onClosedHandler(code, reason) {
    if (this.hearBeatHandle) clearTimeout(this.hearBeatHandle);
    delete this.hearBeatHandle;
    this.pause();
    // this.ws = null;
    super.emit(TransportEvent.ON_CLOSED, { code, reason });
  }

  protected onErrorHandler(err) {
    this.logger.error("onError(err)", err);
    if (this.hearBeatHandle) clearTimeout(this.hearBeatHandle);
    delete this.hearBeatHandle;
    this.pause();
    super.emit(TransportEvent.ON_ERROR, err);
  }

  protected onMessageHandler(rawMsg: string) {
    // this.logger.verbose("onMessage(rawMsg): '%s'", rawMsg);
    super.emit(TransportEvent.ON_MESSAGE, JSON.parse(rawMsg));
  }

  /**
   * To keep the websockets alive and to check whether there is a server, we do a ping pong in a certain (high, i.e. 60secs) interval
   * @param If true, the check waits for a pong to validate the server is alive. IMPORTANT: make sure the server can handle the pong, otherwise
   * the connection will be declared unhealthy!
   */
  private heartBeatCheck(verifyWithPong = false, pongTimeoutMs = 100) {
    const proceed = () => {
      this.hearBeatHandle = setTimeout(() => {
        this.heartBeatCheck();
      }, this.conf ? this.conf.pingInterval : DefaultWsTransportConfig.PING_INTERVAL);
    };

    if (this.hearBeatHandle) clearTimeout(this.hearBeatHandle);
    delete this.hearBeatHandle;

    if (!this.ws) return proceed();

    if (verifyWithPong) {
      const waitForPong = setTimeout(() => this.onErrorHandler(`No pong received after waiting ${pongTimeoutMs}ms!`), pongTimeoutMs /* waiting for a pong */);
      this.ws.on(WSEvents.PONG, () => {
        clearTimeout(waitForPong);
        proceed();
      });
      this.ws.ping();
    } else {
      this.ws.ping();
      proceed();
    }
  }

  /**
   * Waits for the WebSocket to be ready
   * @param socket The websocket to wait on
   * @param callback The callback resolves asa the websocket connection is OPEN or the timeout hit
   */
  private waitForSocketConnection(
    socket: WebSocket,
    callback: (err?: string) => void,
    retryTimeoutInMs = this.conf ? this.conf.messagingRetryIntervalMs : DefaultWsTransportConfig.MESSAGING_RETRY_INTERVAL_MS,
    maxRetries = this.conf ? this.conf.messagingMaxRetries : DefaultWsTransportConfig.MESSAGING_MAX_RETRIES,
  ) {
    if (maxRetries < 0) {
      return callback("Waited for sockets to reconnect. Max timeout reached!");
    }

    if (socket.readyState === WebSocket.OPEN) {
      if (callback != null) {
        callback();
      }
    } else {
      setTimeout(() => {
        this.logger.info("wait for connection...");
        this.waitForSocketConnection(socket, callback, retryTimeoutInMs, --maxRetries);
      }, retryTimeoutInMs);
    }
  }

  /**
   * Depending on the Config object, we can set different timeout values based on mnemonic "ConnectionStrategies".
   * A ConnectionStrategy defines the "behaviour" and is more abstract than setting timeout values directly. If the
   * ConnectionStrategy is != null, we use this and override the timeouts.
   * @param conf
   */
  private adjustConfByConnectionStrategy(newConf: IWsTransportConfig<SessionType>): IWsTransportConfig<SessionType> {
    if (newConf.connectionStrategy) {
      const strat = newConf.connectionStrategy;
      this.logger.info("We override the timeouts in favor of ConnectionStrategy '%s'...", strat);
      switch (strat) {
        case ConnectionStrategy.CLOSE_IMMEDIATE:
          newConf.drainTimeoutMs = 100;
          break;
        case ConnectionStrategy.LEAVE_OPEN:
          // Do nothing, since it is not evaluated
          break;
        case ConnectionStrategy.CLOSE_AFTER_TIMEOUT:
          // Do nothing, since we do not want to override
          break;
      }
    }
    return newConf;
  }
}
