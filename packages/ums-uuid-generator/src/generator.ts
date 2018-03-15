import { IIDGenerator } from "@lp-libs/ums-id-generator";
import { v4 as uuid } from "uuid";

export class UUIDGenerator implements IIDGenerator {
  public generateId(): string {
    return uuid();
  }
}
