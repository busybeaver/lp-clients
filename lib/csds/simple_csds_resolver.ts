import { JsonObject, JsonArray, JsonTypedArray } from "../util/types";
import { CsdsResponse, ICsdsConfig } from "./csds_config";
import { AbstractCsdsResolver } from "./csds_resolver";
import { get } from "../util/request";

interface ICsdsEntry extends JsonObject {
  service: string;
  account: string;
  baseURI: string;
}

interface ICsdsResponse extends JsonObject {
  baseURIs: JsonTypedArray<ICsdsEntry>;
}

export class SimpleCsdsResolver extends AbstractCsdsResolver {
  public async resolve(options: ICsdsConfig): Promise<CsdsResponse> {
    const {csdsDomain, accountId} = options;
    const csdsService = this.hasService(options) ? options.service : null;
    const url = `https://${csdsDomain}/api/account/${accountId}/service/${csdsService ? `${csdsService}/` : ""}baseURI.json?version=1.0`;
    const { body } = await get<ICsdsResponse>(url);

    if (body && body.baseURIs) {
      return body.baseURIs.reduce((obj, {service, baseURI}) => {
        obj[service] = baseURI;
        return obj;
      }, {});
    }
    return {};
  }
}
