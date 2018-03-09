import { Required } from "type-zoo";

import { IUserSession, ISessionProvider, ISessionProviderOptions } from "@lp-libs/le-session-provider";
import { post } from "@lp-libs/util-request";
import { Response } from "got";
import { inspect } from "util";
import { JsonObject } from "@lp-libs/util-types";

// tslint:disable-next-line:no-empty-interface
export interface IConsumerCredentials {
  // empty... so far
}

export interface IAuthenticatedConsumerCredentials extends IConsumerCredentials {
  userId: Required<string>;
  redirectUri?: string;
}

export interface IConsumerSession extends IUserSession {
  sub: string;
  aud: string;
  iss: string;
  exp: string;
  iat: string;
}

export interface IAuthenticatedConsumerSession extends IConsumerSession {
  userId: string;
}

export interface ILoginResponse extends JsonObject {
  jwt: string;
}

export abstract class ConsumerSessionProvider<CredentialsType extends IConsumerCredentials, SessionType extends IConsumerSession> implements ISessionProvider<CredentialsType, SessionType> {
  public async login(credentials: CredentialsType, {csdsConfig, csdsResolver}: ISessionProviderOptions): Promise<SessionType> {
    const { accountId, csdsDomain } = csdsConfig;
    return this.parseJwt(await this.doLogin(credentials, await csdsResolver.resolveService({accountId, csdsDomain, service: "idp"}), accountId), credentials, accountId);
  }

  public abstract async doLogin(credentials: CredentialsType, idpDomain: string, accountId: string): Promise<Response<ILoginResponse>>;

  public async refresh(session: SessionType, options: ISessionProviderOptions): Promise<void> {
    // TODO: is this even currently possible in LE?!?
  }

  public async logout(session: SessionType, options: ISessionProviderOptions): Promise<void> {
    // TODO: is this even currently possible in LE?!?
  }

  protected parseJwt({ body }: Response<ILoginResponse>, credentials: CredentialsType, accountId: string): SessionType {
    if (!body.jwt) throw new Error(`Unprocessable response: ${inspect(body)}`);
    return Object.assign(
      {token: body.jwt, accountId},
      JSON.parse(Buffer.from(body.jwt.split(".")[1], "base64").toString("utf8")),
    );
  }
}

// unauthenticated consumer
export class UnauthenticatedConsumerSessionProvider extends ConsumerSessionProvider<IConsumerCredentials, IConsumerSession> {
  public doLogin(credentials: IConsumerCredentials, idpDomain: string, accountId: string): Promise<Response<ILoginResponse>> {
    const url = `https://${idpDomain}/api/account/${accountId}/signup`;
    return post<ILoginResponse>(url);
  }
}

// authenticated consumer (code flow)
export class AuthenticatedSessionProvider extends ConsumerSessionProvider<IAuthenticatedConsumerCredentials, IAuthenticatedConsumerSession> {
  public doLogin(credentials: IAuthenticatedConsumerCredentials, idpDomain: string, accountId: string): Promise<Response<ILoginResponse>> {
    const url = `https://${idpDomain}/api/account/${accountId}/app/default/authenticate?v=2.0`;
    const body = JSON.stringify({
      code: credentials.userId,
      redirect_uri: credentials.redirectUri || "https://liveperson.net",
    });
    return post<ILoginResponse>(url, {body});
  }

  protected parseJwt(response: Response<ILoginResponse>, credentials: IAuthenticatedConsumerCredentials, accountId: string): IAuthenticatedConsumerSession {
    // add the username/userId to the consumer session
    return Object.assign({ userId: credentials.userId }, super.parseJwt(response, credentials, accountId));
  }
}

// TODO: authenticated consumer (implicit flow)
