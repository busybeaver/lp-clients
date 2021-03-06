import { Required } from "type-zoo";

import { DefaultCsdsClientConfig, ICsdsClientConfig, ICsdsClientConfigBase } from "@lp-libs/csds-client";
import { ISessionProvider, IUserSession } from "@lp-libs/le-session-provider";

// mark everything optional which has default settings in the default config
export interface ILeClientConfigBase<CredentialsType, SessionType extends IUserSession> extends ICsdsClientConfigBase {
  readonly credentials: CredentialsType;
  readonly sessionProvider: ISessionProvider<CredentialsType, SessionType>;
}

export type ILeClientConfig<CredentialsType, SessionType extends IUserSession> = Required<ILeClientConfigBase<CredentialsType, SessionType>>;

export class DefaultLeClientConfig<CredentialsType, SessionType extends IUserSession> extends DefaultCsdsClientConfig implements ILeClientConfig<CredentialsType, SessionType> {
  public readonly credentials: CredentialsType;
  public readonly sessionProvider: ISessionProvider<CredentialsType, SessionType>;

  constructor(config: ILeClientConfigBase<CredentialsType, SessionType>) {
    super(config);
    this.credentials = config.credentials;
    this.sessionProvider = config.sessionProvider;
  }
}
