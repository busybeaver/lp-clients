// those types and interfaces in this file are general purpose, like those in
// the default typescript lib; so don't prefix them with a capital I to make
// them better "fit in"
/* tslint:disable: interface-name */

import * as _StateMachine from "javascript-state-machine";
import { StateMachineConstructor } from "./typings/state-machine";

// ---------------

export const StateMachine: StateMachineConstructor = _StateMachine as StateMachineConstructor;

// ---------------

type JsonType = boolean | number | string | null | JsonStructure;
export type JsonStructure = JsonObject | JsonArray | JsonTypedArray<any>;
export interface JsonObject { [key: string]: JsonType; }
export interface JsonArray extends JsonTypedArray<JsonType> {}
export interface JsonTypedArray<T extends JsonType> extends Array<T> {}
export const isJsonArray = (jsonType: JsonType): jsonType is JsonArray => Array.isArray(jsonType);
export const isJsonObject = (jsonType: JsonType): jsonType is JsonObject => {
  return jsonType !== null // null is consered as type object!
    && typeof jsonType === "object"
    && !isJsonArray(jsonType); // arrays are also of type object
};

// ---------------

export type Nullable<T> = T | undefined;
type Purify<T extends string> = { [P in T]: T; }[T];
/**
 * Make all properties of `T` optional.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/15012#issuecomment-346499713
 */
export type Optional<T> = {
  [P in Purify<keyof T>]: Nullable<T[P]>;
};
