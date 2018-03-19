import { IIDGenerator } from "../src/generator";

export interface IMockIIDGenerator extends IIDGenerator {
  id: string;
}

export const MockIIDGenerator = jest.fn<IMockIIDGenerator>(() => {
  return new (class implements IMockIIDGenerator {
    public id = "1337";
    public generateId = jest.fn(() => this.id);
  })();
});
