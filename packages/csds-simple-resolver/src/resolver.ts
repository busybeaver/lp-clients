import { JsonObject, JsonArray, JsonTypedArray } from "@lp-libs/util-types";
import { CsdsResponse, ICsdsConfig } from "@lp-libs/csds-config";
import { AbstractCsdsResolver } from "@lp-libs/csds-resolver";
import { get } from "@lp-libs/util-request";

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

    if (body) {
      const response = body.baseURIs || [ body ];
      return response.reduce((obj, {service, baseURI}) => {
        obj[service] = baseURI;
        return obj;
      }, {});
    }
    return {};
  }
}
