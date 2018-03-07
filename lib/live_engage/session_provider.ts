import { JsonObject } from "../util/types";
import { ICsdsConfig } from "../csds/csds_config";
import { ICsdsResolver } from "../csds/csds_resolver";

export interface ISessionProviderOptions {
  csdsConfig: ICsdsConfig;
  csdsResolver: ICsdsResolver;
}

export interface IUserSession extends JsonObject {
  accountId: string;
  token: string;
}

export interface ISessionProvider<CredentialsType, SessionType extends IUserSession> {
  login(credentials: CredentialsType, options: ISessionProviderOptions): Promise<SessionType>;
  refresh(session: SessionType, options: ISessionProviderOptions): Promise<void>;
  logout(session: SessionType, options: ISessionProviderOptions): Promise<void>;
}
