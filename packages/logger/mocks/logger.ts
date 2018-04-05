import { ILogger, ILoggerFactory } from "../src/logger";

export const MockLogger = jest.fn<ILogger>(() => {
  return new (class implements ILogger {
    public verbose = jest.fn<void>();
    public debug = jest.fn<void>();
    public info = jest.fn<void>();
    public warn = jest.fn<void>();
    public error = jest.fn<void>();
  })();
});

export const MockLoggerFactory = jest.fn<ILoggerFactory>(() => {
  return new (class implements ILoggerFactory {
    public create = jest.fn<ILogger>(() => new MockLogger());
  })();
});
