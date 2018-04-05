export interface IIDGenerator {
  // generate a random uuid
  generateId(): string;
}

// source: https://gist.github.com/jed/982883
// tslint:disable-next-line:no-bitwise
const generate = (a?) => a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generate);
export class DefaultIDGenerator implements IIDGenerator {
  public generateId(): string {
    return generate();
  }
}
