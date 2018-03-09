import { JsonObject } from "@lp-libs/util-types";
import { ICsdsConfig } from "@lp-libs/csds-config";
import { ICsdsResolver } from "@lp-libs/csds-resolver";

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
