import { IUserSession } from "./session_provider";
import { CsdsClient } from "../csds/csds_client";
import { ILeClientConfig } from "./le_client_config";
import { request } from "../util/request";
import { GotOptions, Response } from "got";
import { JsonStructure } from "../util/types";

export class LeClient<ConfigType extends ILeClientConfig<CredentialsType, SessionType>, CredentialsType, SessionType extends IUserSession> extends CsdsClient<ConfigType> {

  private leSession?: SessionType;

  constructor(config: ConfigType, loggerName: string = "LeClient") {
    super(config, loggerName);
  }

  // this way super classes cannot set/clear this.domains, but access it
  public get credentials(): SessionType {
    this.checkStarted();
    // this "cast" always works since it's always present when the client is
    // initialized (and if the client isn't initialized, 'checkStarted' will
    // throw an error before we reach this stage)
    return this.leSession as SessionType;
  }

  // perform an authenticated request against LP/LE APIs
  public authenticatedRequest<R extends JsonStructure>(url: string, options: GotOptions<string> & /* make method mandatory */ {method: string}): Promise<Response<R>> {
    this.checkStarted();
    const opts = Object.assign({headers: {}}, options);
    opts.headers.Authorization = `Bearer ${this.credentials.token}`;
    return request<R>(url, opts);
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStart(): Promise<void> {
    await super.onStart();
    this.leSession = await this.config.sessionProvider.login(this.config.credentials, this.config);
  }

  // add functionality that should be called during the stop task;
  // super classes which override this method should usually call the
  // super method first
  protected async onStop(): Promise<void> {
    await super.onStop();
    if (this.leSession) await this.config.sessionProvider.logout(this.leSession, this.config);
    delete this.leSession;
  }

  // add functionality that should be called during the refresh task
  // (which is periodically called); super classes which override this
  // method should usually call the super method first
  protected async onRefresh(): Promise<void> {
    await super.onRefresh();
    if (this.leSession) await this.config.sessionProvider.refresh(this.leSession, this.config);
  }
}
