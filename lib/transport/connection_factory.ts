import { IUserSession } from "../live_engage/session_provider";

export interface IConnectionOpts<SessionType extends IUserSession> {
  domain: string;
  session: SessionType;
}

// mark everything optional which has default settings in the default config
export interface IConnectionFactory<SessionType extends IUserSession> {
  endpoint: (opts: IConnectionOpts<SessionType>) => string;
  headers: (opts: IConnectionOpts<SessionType>) => { [key: string]: string };
}
