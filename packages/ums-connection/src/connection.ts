import { IUserSession } from "@lp-libs/le-session-provider";
import { Optional } from "@lp-libs/util-types";
import { IConnectionFactory, IConnectionOpts } from "@lp-libs/transport";

// mark everything optional which has default settings in the default config
// export type IConnectionFactoryBase<SessionType extends IUserSession> = Optional<IConnectionFactory<SessionType>>;

export abstract class BaseWsConnectionFactory<SessionType extends IUserSession> implements IConnectionFactory<SessionType> {
  public abstract readonly endpoint: (opts: IConnectionOpts<SessionType>) => string;

  public headers = ({ session }: IConnectionOpts<SessionType>): { [key: string]: string } => {
    return {
      Authorization: `jwt ${session.token}`,
    };
  }
}

export class ConsumerWsConnectionFactory<SessionType extends IUserSession> extends BaseWsConnectionFactory<SessionType> {
  public readonly endpoint = ({ domain, session }: IConnectionOpts<SessionType>): string => {
    return `wss://${domain}/ws_api/account/${session.accountId}/messaging/consumer?v=3`;
  }
}

export class AgentWsConnectionFactory<SessionType extends IUserSession> extends BaseWsConnectionFactory<SessionType> {
  public readonly endpoint = ({ domain, session }: IConnectionOpts<SessionType>): string => {
    // return `wss://${domain}/ws_api/account/${session.accountId}/messaging/brand/${session.token}?v=2`;
    return `wss://${domain}/ws_api/account/${session.accountId}/messaging/brand?v=2`;
  }
}
