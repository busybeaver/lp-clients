import { setTimeout, clearTimeout } from "timers";

import StateMachine from "@taoqf/javascript-state-machine";
import { CsdsResponse } from "@lp-libs/csds-config";
import { ICsdsClientConfig } from "./config";
import { ILogger } from "@lp-libs/logger";

const enum ClientState {
  STARTED = "started",
  STOPPED = "stopped",
}

const enum ClientTransition {
  START = "start",
  STOP = "stop",
  REFRESH = "refresh",
}

export class CsdsClient<ConfigType extends ICsdsClientConfig> {

  protected readonly logger: ILogger;
  protected readonly config: ConfigType;

  private readonly stateMachine: StateMachine;
  private csdsDomains?: CsdsResponse;
  private refreshTask?: NodeJS.Timer;

  constructor(config: ConfigType, loggerName: string = "CsdsClient") {
    this.config = Object.assign({}, config); // "de-reference"
    this.logger = config.loggerFactory.create(loggerName);

    const name = (transition: string) => `on${transition.charAt(0).toUpperCase() + transition.slice(1)}`;
    // @ts-ignore (proper state machine config object, but TS typings are outdated)
    // https://github.com/jakesgordon/javascript-state-machine/tree/c22a9d3da9e780dcd48ac90f8afa3ec8fe16f5ae#usage
    this.stateMachine = new StateMachine({
      init: ClientState.STOPPED,
      transitions: [
        { name: ClientTransition.START,   from: ClientState.STOPPED,  to: ClientState.STARTED },
        { name: ClientTransition.STOP,    from: ClientState.STARTED,  to: ClientState.STOPPED },
        { name: ClientTransition.REFRESH, from: ClientState.STARTED,  to: ClientState.STARTED },
      ],
      methods: {
        [name(ClientTransition.START)]: () => this[name(ClientTransition.START)](), // keep "this" context
        [name(ClientTransition.STOP)]: () => this[name(ClientTransition.STOP)](), // keep "this" context
        [name(ClientTransition.REFRESH)]: () => this[name(ClientTransition.REFRESH)](), // keep "this" context
        onTransition: ({transition, from, to}) => this.logger.info(`Going to '${transition}' client`),
        onEnterState: ({to}) => this.logger.info(`Client is now in state '${to}'`),
      },
    });
  }

  // do not override this method! use the onStart method instead
  public async start(): Promise<void> {
    return this.stateMachine.start();
  }

  // do not override this method! use the onStop method instead
  public async stop(): Promise<void> {
    return this.stateMachine.stop();
  }

  // do not override this method! use the onRefresh method instead
  public async refresh(): Promise<void> {
    // manual refresh
    return this.stateMachine.refresh();
  }

  public get state(): string {
    // @ts-ignore (state property exists in JS but is missing in the TS typings)
    // https://github.com/jakesgordon/javascript-state-machine/blob/c22a9d3da9e780dcd48ac90f8afa3ec8fe16f5ae/docs/states-and-transitions.md#conditional-transitions
    // https://github.com/jakesgordon/javascript-state-machine/blob/e09614a51f2a64724bb151da6462bcb34fdb9883/lib/state-machine.js#L571-L582
    return this.stateMachine.state;
  }

  public get started(): boolean {
    return this.state === ClientState.STARTED;
  }

  // this way super classes cannot set/clear this.domains, but access it
  public get domains(): CsdsResponse {
    this.checkStarted();
    // this "cast" always works since it's always present when the client is
    // initialized (and if the client isn't initialized, 'checkStarted' will
    // throw an error before we reach this stage)
    return this.csdsDomains as CsdsResponse;
  }

  public get accountId(): string {
    return this.config.csdsConfig.accountId;
  }

  // add functionality that should be called during the start task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStart(): Promise<void> {
    await this.onRefresh(); // refresh during start (don't call this.refresh())
    await this.queueRefreshTask(); // periodically refresh
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStop(): Promise<void> {
    if (this.refreshTask) clearTimeout(this.refreshTask);
    delete this.refreshTask;
    delete this.csdsDomains;
  }

  // add functionality that should be called during the refresh task
  // (which is periodically called); super classes which override this
  // method should usually call the super method first
  protected async onRefresh(): Promise<void> {
    this.csdsDomains = await this.config.csdsResolver.resolve(this.config.csdsConfig);
  }

  protected checkStarted(): void {
    if (!this.started) throw new Error("Client not started/initialized yet");
  }

  private queueRefreshTask() {
    this.refreshTask = setTimeout((async () => {
      this.logger.debug("Going to refresh client...");
      if (this.stateMachine.can(ClientTransition.REFRESH)) {
        await this.refresh(); // run 'refresh' on the state machine
      } else {
        this.logger.warn();
      }
      this.queueRefreshTask(); // requeue task
    }), this.config.refreshInterval);
  }
}
