import { JsonStructure, isJsonObject } from "@lp-client/util-types";

import got, {
  get as getFn,
  post as postFn,
  GotFn,
  GotUrl,
  GotOptions,
  Response,
  GotBodyOptions,
} from "got";

const doRequest = async <R extends JsonStructure> (requestFn: GotFn, url: GotUrl, opts?: GotOptions<string>, secondTry: boolean = false): Promise<Response<R>> => {
  const options = Object.assign({headers: []}, opts, {encoding: "utf-8", json: true});

  const response = await Reflect.apply(requestFn, null, [url, options]) as Response<R>;
  const { body, statusCode, statusMessage } = response;

  if (statusCode === 503 && !secondTry) return doRequest<R>(requestFn, url, opts, true);
  if (statusCode !== 200) throw (isJsonObject(body) && body.error) ? new Error(String(body.error)) : new Error(`${statusCode || "None"} ${statusMessage || "None"}`);
  return response;
};

// simplify calling against LE APIs (i.e. make it more robust) // assumes JSON/UTF8 requests

export const get = <R extends JsonStructure> (url: GotUrl, opts?: GotOptions<string>): Promise<Response<R>> => doRequest(getFn, url, opts);
export const post = <R extends JsonStructure> (url: GotUrl, opts?: GotBodyOptions<string>): Promise<Response<R>> => doRequest(postFn, url, opts);
// export const request = <R extends JsonStructure> (url: GotUrl, opts: GotOptions<string> & /* make method mandatory */ {method: string}): Promise<Response<R>> => doRequest(got, url, opts);
