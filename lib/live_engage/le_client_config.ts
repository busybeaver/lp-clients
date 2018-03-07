import { Required } from "type-zoo";

import { DefaultCsdsClientConfig, ICsdsClientConfig, ICsdsClientConfigBase } from "../csds/csds_client_config";
import { ISessionProvider, IUserSession } from "./session_provider";

// mark everything optional which has default settings in the default config
export interface ILeClientConfigBase<CredentialsType, SessionType extends IUserSession> extends ICsdsClientConfigBase {
  credentials: CredentialsType;
  sessionProvider: ISessionProvider<CredentialsType, SessionType>;
}

export type ILeClientConfig<CredentialsType, SessionType extends IUserSession> = Required<ILeClientConfigBase<CredentialsType, SessionType>>;

export class DefaultLeClientConfig<CredentialsType, SessionType extends IUserSession> extends DefaultCsdsClientConfig implements ILeClientConfig<CredentialsType, SessionType> {
  public credentials: CredentialsType;
  public sessionProvider: ISessionProvider<CredentialsType, SessionType>;

  constructor(config: ILeClientConfigBase<CredentialsType, SessionType>) {
    super(config);
  }
}
