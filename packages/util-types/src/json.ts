// those types and interfaces in this file are general purpose, like those in
// the default typescript lib; so don't prefix them with a capital I to make
// them better "fit in"
/* tslint:disable: interface-name */

export type JsonType = boolean | number | string | null | JsonStructure;
export type JsonStructure = JsonObject | JsonArray | JsonTypedArray<any>;
export interface JsonObject { [key: string]: JsonType; }
export interface JsonArray extends JsonTypedArray<JsonType> {}
export interface JsonTypedArray<T extends JsonType> extends Array<T> {}
export const isJsonArray = (jsonType: JsonType): jsonType is JsonArray => Array.isArray(jsonType);
export const isJsonObject = (jsonType: JsonType): jsonType is JsonObject => {
  return jsonType !== null // null is considered as type object!
    && typeof jsonType === "object"
    && !isJsonArray(jsonType); // arrays are also of type object
};
