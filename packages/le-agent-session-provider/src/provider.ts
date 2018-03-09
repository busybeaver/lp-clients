import { Required } from "type-zoo";
import { IUserSession, ISessionProvider, ISessionProviderOptions } from "@lp-libs/le-session-provider";
import { post } from "@lp-libs/util-request";
import { serialize, parse } from "cookie";
import { Response } from "got";
import { JsonObject } from "@lp-libs/util-types";

export interface IAgentCredentials {
  // name must be the same as the body param in the login request!
  // do not rename unless you know what you are doing
  username: Required<string>;
}

export interface IAgentPasswordCredentials extends IAgentCredentials {
  // name must be the same as the body param in the login request!
  // do not rename unless you know what you are doing
  password: Required<string>;
}

export interface IAgentTokenCredentials extends IAgentCredentials {
  // names must be the same as the body param in the login request!
  // do not rename unless you know what you are doing
  appKey: Required<string>;
  secret: Required<string>;
  accessToken: Required<string>;
  accessTokenSecret: Required<string>;
}

export interface IAgentLoginConfig extends JsonObject {
  loginName: string;
  userId: string;
  userPid: string;
  userPrivileges: number[];
  serverCurrentTime: number;
  timeDiff: number;
  serverTimeZoneName: string;
  serverTimeGMTDiff: number;
  isLPA: boolean;
  isAdmin: boolean;
  accountTimeZoneId: string;
}

export interface IBaseURI extends JsonObject {
  account: string;
  baseURI: string;
  service: string;
}

export interface ICsdsCollectionResponse extends JsonObject {
  baseURIs: IBaseURI[];
}

export interface IAgentLoginAgentGroupsDataItem extends JsonObject {
  id: number;
  deleted: boolean;
  name: string;
}

export interface IAgentLoginAgentGroupsData extends JsonObject {
  items: IAgentLoginAgentGroupsDataItem[];
  revision: number;
}

export interface IAgentLoginAccountData extends JsonObject {
  agentGroupsData: IAgentLoginAgentGroupsData;
}

export interface IAgentLoginCredentials extends JsonObject {
  csrf: string;
  wsuk: number;
  config: IAgentLoginConfig;
  csdsCollectionResponse: ICsdsCollectionResponse;
  accountData: IAgentLoginAccountData;
  sessionTTl: string;
  bearer: string;
}

export interface IAgentSession extends IUserSession {
  credentials: IAgentLoginCredentials;
  cookies: { [key: string]: string };
}

export class AgentSessionProvider<CredentialsType extends IAgentCredentials> implements ISessionProvider<CredentialsType, IAgentSession> {
  public async login(credentials: CredentialsType, options: ISessionProviderOptions): Promise<IAgentSession> {
    const { accountId, csdsDomain } = options.csdsConfig;
    const reqBody = Object.assign(credentials, { accountId, csdsDomain });
    const { body, headers } = await this.doRequest<IAgentLoginCredentials>(reqBody, {}, options, "login");
    const cookies = (headers["set-cookie"] || [])
      .map((value) => parse(value))
      .reduce((obj, entry) => Object.assign(obj, entry), {});
    return { credentials: body, cookies, accountId, token: body.bearer };
  }

  public refresh(session: IAgentSession, options: ISessionProviderOptions): Promise<void> {
    return this.doSessionRequest(session, options, "refresh");
  }

  public logout(session: IAgentSession, options: ISessionProviderOptions): Promise<void> {
    return this.doSessionRequest(session, options, "logout");
  }

  private async doSessionRequest(session: IAgentSession, options: ISessionProviderOptions, path: string): Promise<void> {
    const { credentials, cookies } = session;
    await this.doRequest<JsonObject>({ csrf: credentials.csrf }, cookies, options, path);
  }

  private async doRequest<R extends JsonObject>(body: {[key: string]: string}, cookies: { [key: string]: string }, { csdsConfig, csdsResolver }: ISessionProviderOptions, path: string): Promise<Response<R>> {
    const { accountId, csdsDomain } = csdsConfig;
    const domain = await csdsResolver.resolveService({accountId, csdsDomain, service: "agentVep"});
    const url = `https://${domain}/api/account/${accountId}/${path}?v=1.3`;
    return post<R>(url, {
      body: JSON.stringify(body),
      headers: {
        cookie: Object.keys(cookies).map((key) => serialize(key, cookies[key])),
      },
    });
  }
}
