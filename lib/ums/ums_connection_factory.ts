import { IUserSession } from "../live_engage/session_provider";
import { initConfig } from "../util/config";
import { Optional } from "../util/types";
import { IConnectionFactory, IConnectionOpts } from "../transport/connection_factory";

// mark everything optional which has default settings in the default config
type IConnectionFactoryBase<SessionType extends IUserSession> = Optional<IConnectionFactory<SessionType>>;

abstract class BaseWsConnectionFactory<SessionType extends IUserSession> implements IConnectionFactory<SessionType> {
  public abstract endpoint: (opts: IConnectionOpts<SessionType>) => string;

  constructor(config?: IConnectionFactoryBase<SessionType>) {
    initConfig(this, config);
  }

  public headers = ({ session }: IConnectionOpts<SessionType>): { [key: string]: string } => {
    return {
      Authorization: `jwt ${session.token}`,
    };
  }
}

export class ConsumerWsConnectionFactory<SessionType extends IUserSession> extends BaseWsConnectionFactory<SessionType> {
  public endpoint = ({ domain, session }: IConnectionOpts<SessionType>): string => {
    return `wss://${domain}/ws_api/account/${session.accountId}/messaging/consumer?v=3`;
  }
}

export class AgentWsConnectionFactory<SessionType extends IUserSession> extends BaseWsConnectionFactory<SessionType> {
  public endpoint = ({ domain, session }: IConnectionOpts<SessionType>): string => {
    // return `wss://${domain}/ws_api/account/${session.accountId}/messaging/brand/${session.token}?v=2`;
    return `wss://${domain}/ws_api/account/${session.accountId}/messaging/brand?v=2`;
  }
}
