/// <reference types="expect-more-jest" />
import { ConsoleLogger, ConsoleLoggerFactory } from "./logger";

const originals = {};
const fn = jest.fn();

beforeAll(() => {
  Object.keys(global.console).forEach((key) => {
    originals[key] = global.console[key];
    global.console[key] = fn;
  });
});

afterAll(() => {
  Object.keys(global.console).forEach((key) => {
    global.console[key] = originals[key];
  });
});

test("ConsoleLoggerFactory functionality", () => {
  const loggerFactory = new ConsoleLoggerFactory();
  expect(loggerFactory).toBeInstanceOf(ConsoleLoggerFactory);
  expect(loggerFactory.create).toBeFunction();
  expect(loggerFactory.create("")).toBeInstanceOf(ConsoleLogger);
});

test("ConsoleLogger functionality", () => {
  const name = "test_logger";
  const logger = new ConsoleLogger(name);
  expect(logger).toBeInstanceOf(ConsoleLogger);
  let counter = 0;
  ["debug", "error", "info", "verbose", "warn"].forEach((lvl) => {
    expect(logger[lvl]).toBeFunction();
    const msg1 = "This is a test " + counter;
    logger[lvl](msg1);
    expect(fn).toHaveBeenCalledTimes(++counter);
    expect(fn).toHaveBeenLastCalledWith(expect.stringMatching(msg1));
    const msg2 = "foo";
    const arg1 = "bar";
    const arg2 = "42";
    logger[lvl](msg2, arg1, arg2);
    expect(fn).toHaveBeenCalledTimes(++counter);
    expect(fn).toHaveBeenLastCalledWith(
      expect.stringMatching(msg2), expect.stringMatching(arg1), expect.stringMatching(arg2),
    );
  });
});
