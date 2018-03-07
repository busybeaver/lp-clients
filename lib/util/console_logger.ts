import { ILogger, ILoggerFactory } from "./logger";
import { Chalk, ColorSupport } from "chalk"; // only load type information here since it's an optional dependency

// async init:
// chalk is an optional dependency and not always present
let colors = {};
import("chalk")
  .then((chalk) => colors = { ...chalk.default })
    // ignore error
  .catch(() => {});
const getColor = (color: keyof Chalk): (text: string) => string => {
  return colors[color] ? colors[color] : ((text: string) => text);
};

/**
 * A logger implementation using simple console logging.
 */
export class ConsoleLogger implements ILogger {

  constructor(private readonly name: string) { }

  public verbose(message?: any, ...optionalParams: any[]): void {
    // there is no verbose level in the console object
    this.log(console.log, "grey", message, ...optionalParams);
  }
  public debug(message?: any, ...optionalParams: any[]): void {
    // the debug function of the console object is an alias for the log function
    // https://nodejs.org/api/console.html#console_console_debug_data_args
    this.log(console.log, "white", message, ...optionalParams);
  }
  public info(message?: any, ...optionalParams: any[]): void {
    this.log(console.info, "whiteBright", message, ...optionalParams);
  }
  public warn(message?: any, ...optionalParams: any[]): void {
    this.log(console.warn, "yellow", message, ...optionalParams);
  }
  public error(message?: any, ...optionalParams: any[]): void {
    this.log(console.error, "red", message, ...optionalParams);
  }
  private log(logFn, color: keyof Chalk, message?: any, ...optionalParams: any[]): void {
    const coloring = getColor(color);
    process.stdout.write(coloring(`[${this.name}] `));
    const args = [message, ...optionalParams].map((arg) => typeof arg === "string" ? coloring(arg) : arg);
    Reflect.apply(logFn, null, args);
  }
}

/**
 * A logger factory which returns console logger instances.
 */
export class ConsoleLoggerFactory implements ILoggerFactory {
  public create(name: string): ILogger {
    return new ConsoleLogger(name);
  }
}
